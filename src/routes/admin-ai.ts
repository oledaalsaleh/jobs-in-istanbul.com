import { Hono } from 'hono'

export const adminAiRouter = new Hono()

adminAiRouter.post('/api/admin/process-ai', async (c) => {
  const env: any = c.env;
  
  // Basic security check: ensure an Admin API Key is provided
  // We can use the JWT_SECRET from env as a makeshift API key for this custom route
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${env.JWT_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body: any = await c.req.json();
    const rawText = body.text;

    if (!rawText) {
      return c.json({ error: 'Missing text in request body' }, 400);
    }

    const aiPrompt = `
    أنت خبير محترف في تصنيف وتنظيف إعلانات الوظائف في إسطنبول. 
    مهمتك هي قراءة النص المرفق واستخراج البيانات منه بدقة باللغة العربية.
    يجب أن تكون الإجابة بصيغة JSON نظيفة فقط، وبدون أي مقدمات أو شرح أو نصوص إضافية.
    إذا لم تجد قيمة معينة اكتب "".
    الصيغة المطلوبة:
    {
      "title": "مسمى وظيفي قصير وجذاب",
      "company": "اسم الشركة",
      "location": "اسم المنطقة",
      "contact": "رقم الهاتف",
      "salary": "الراتب إن وجد"
    }`;

    // 1. Call Cloudflare AI
    const aiResponse: any = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
      messages: [
        { role: 'system', content: aiPrompt },
        { role: 'user', content: rawText }
      ]
    });

    // 2. Parse AI response
    let rawResponse = aiResponse.response;
    // Strip markdown formatting if AI added it
    rawResponse = rawResponse.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const cleanData = JSON.parse(rawResponse);

    // 3. Save to database as a draft
    const db = env.DB;
    const nowMs = Date.now();
    const id = `job-ai-${nowMs}-${Math.random().toString(36).substring(2, 7)}`;
    const slug = `${(cleanData.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nowMs}`;
    
    const docData = JSON.stringify({
      title_ar: cleanData.title || 'غير محدد',
      title_en: cleanData.title || 'Unspecified',
      slug: slug,
      description_ar: rawText,
      description_en: rawText,
      company: cleanData.company || 'غير محدد',
      category: 'cat-general',
      location_ar: cleanData.location || '',
      location_en: cleanData.location || '',
      jobType: 'full-time',
      salary: cleanData.salary || '',
      applyEmail: cleanData.contact || '', // Contact info goes here for AI
      language: 'both',
      featured: false,
      publishedAt: nowMs,
      status: 'draft'
    });

    await db.prepare(
      `INSERT INTO documents (id, root_id, type_id, status, is_published, is_current_draft, slug, title, data, created_at, updated_at)
       VALUES (?, ?, 'jobs', 'draft', 0, 1, ?, ?, ?, ?, ?)`
    ).bind(id, id, slug, cleanData.title || 'وظيفة جديدة', docData, nowMs, nowMs).run();

    return c.json({ success: true, data: cleanData, message: `تم إدخال وظيفة بنجاح: ${cleanData.title}` });

  } catch (error: any) {
    console.error("AI Processing Error:", error);
    return c.json({ error: 'حدث خطأ أثناء معالجة الإعلان بالذكاء الاصطناعي', details: error.message }, 500);
  }
})

// Admin UI for the AI Extractor
adminAiRouter.get('/admin/ai-extractor', (c) => {
  const env: any = c.env;
  
  const html = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>AI Job Extractor - Admin</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f9; padding: 40px; color: #333; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      h1 { color: #2c3e50; margin-bottom: 10px; }
      textarea { width: 100%; padding: 15px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; margin-bottom: 20px; resize: vertical; min-height: 200px; }
      button { background: #3498db; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; cursor: pointer; transition: 0.3s; }
      button:hover { background: #2980b9; }
      .result { margin-top: 20px; padding: 20px; background: #e8f8f5; border: 1px solid #1abc9c; border-radius: 5px; display: none; }
      .error { margin-top: 20px; padding: 20px; background: #fdf2e9; border: 1px solid #e67e22; border-radius: 5px; display: none; color: #d35400; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>استخراج الوظائف بالذكاء الاصطناعي 🤖</h1>
      <p>قم بنسخ نص الإعلان العشوائي (من تلغرام أو واتساب) والصقه هنا، وسيقوم الذكاء الاصطناعي باستخراج البيانات وحفظها كمسودة.</p>
      
      <textarea id="rawText" placeholder="الصق الإعلان هنا..."></textarea>
      <button id="submitBtn">استخراج وحفظ</button>
      
      <div id="resultBox" class="result"></div>
      <div id="errorBox" class="error"></div>
    </div>

    <script>
      document.getElementById('submitBtn').addEventListener('click', async () => {
        const text = document.getElementById('rawText').value;
        const btn = document.getElementById('submitBtn');
        const resBox = document.getElementById('resultBox');
        const errBox = document.getElementById('errorBox');
        
        if (!text.trim()) return alert('الرجاء إدخال نص أولاً!');
        
        btn.innerText = 'جاري المعالجة... ⏳';
        btn.disabled = true;
        resBox.style.display = 'none';
        errBox.style.display = 'none';
        
        try {
          const response = await fetch('/api/admin/process-ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ${env.JWT_SECRET}'
            },
            body: JSON.stringify({ text })
          });
          
          const data = await response.json();
          if (response.ok) {
            resBox.innerHTML = '<h3>تم بنجاح! ✅</h3><p>' + data.message + '</p><pre dir="ltr" style="text-align: left; background:#fff; padding:10px;">' + JSON.stringify(data.data, null, 2) + '</pre>';
            resBox.style.display = 'block';
            document.getElementById('rawText').value = '';
          } else {
            errBox.innerHTML = 'خطأ: ' + (data.error || 'فشل المعالجة') + '<br><small dir="ltr" style="display:block;margin-top:10px;color:#777;background:#fff;padding:5px;border:1px dashed #ccc;overflow-x:auto;">' + (data.details || 'No details available') + '</small>';
            errBox.style.display = 'block';
          }
        } catch(e) {
          errBox.innerText = 'حدث خطأ في الاتصال بالسيرفر: ' + e.message;
          errBox.style.display = 'block';
        }
        
        btn.innerText = 'استخراج وحفظ';
        btn.disabled = false;
      });
    </script>
  </body>
  </html>
  `;
  return c.html(html);
});
