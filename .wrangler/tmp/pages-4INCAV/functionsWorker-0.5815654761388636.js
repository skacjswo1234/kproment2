var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/admin-change-password.js
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uD544\uC218 \uC815\uBCF4\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const db = env.kproment2_db || env["kproment2-db"];
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uC5F0\uACB0 \uC624\uB958" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admin_password (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        password TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const row = await db.prepare("SELECT password FROM admin_password WHERE id = 1").first();
    if (!row) {
      await db.prepare("INSERT OR IGNORE INTO admin_password (id, password) VALUES (1, ?)").bind("1234").run();
    }
    const current = row ? row.password : "1234";
    if (currentPassword !== current) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (newPassword.length < 4) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uC0C8 \uBE44\uBC00\uBC88\uD638\uB294 4\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await db.prepare("INSERT OR REPLACE INTO admin_password (id, password, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)").bind(newPassword).run();
    return new Response(JSON.stringify({ success: true, message: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD \uC624\uB958:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(onRequestPost, "onRequestPost");
async function onRequestOptions(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");

// api/admin-inquiries.js
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const db = env.kproment2_db || env["kproment2-db"];
    if (!db) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uC5F0\uACB0 \uC624\uB958"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await db.prepare(`
      SELECT 
        id,
        session_id,
        question_id,
        question_text,
        answer_text,
        answer_category,
        created_at
      FROM user_answers 
      ORDER BY created_at DESC
    `).all();
    const inquiriesBySession = {};
    result.results.forEach((row) => {
      const sessionId = row.session_id;
      if (!inquiriesBySession[sessionId]) {
        inquiriesBySession[sessionId] = {
          sessionId,
          answers: [],
          createdAt: row.created_at,
          totalQuestions: 0
        };
      }
      inquiriesBySession[sessionId].answers.push({
        questionId: row.question_id,
        questionText: row.question_text,
        answerText: row.answer_text,
        answerCategory: row.answer_category,
        createdAt: row.created_at
      });
      inquiriesBySession[sessionId].totalQuestions++;
    });
    const inquiries = Object.values(inquiriesBySession).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return new Response(JSON.stringify({
      success: true,
      inquiries,
      total: inquiries.length
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("\uBB38\uC758\uB9AC\uC2A4\uD2B8 \uC870\uD68C \uC624\uB958:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(onRequestPost2, "onRequestPost");
async function onRequestOptions2(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions2, "onRequestOptions");

// api/admin-login.js
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    const { password } = await request.json();
    if (!password) {
      return new Response(JSON.stringify({ success: false, message: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const db = env.kproment2_db || env["kproment2-db"];
    if (!db) {
      console.error("D1 \uBC14\uC778\uB529 \uB204\uB77D:", Object.keys(env || {}));
    }
    if (!db) {
      return new Response(JSON.stringify({ success: false, message: "\uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uC5F0\uACB0 \uC624\uB958" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    try {
      await db.exec(`
      CREATE TABLE IF NOT EXISTS admin_password (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        password TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    } catch (e) {
      console.error("\uD14C\uC774\uBE14 \uC0DD\uC131/exec \uC2E4\uD328:", e);
      return new Response(JSON.stringify({ success: false, message: "DB \uCD08\uAE30\uD654 \uC2E4\uD328", detail: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    let row;
    try {
      row = await db.prepare("SELECT password FROM admin_password WHERE id = 1").first();
    } catch (e) {
      console.error("\uBE44\uBC00\uBC88\uD638 \uC870\uD68C \uC2E4\uD328:", e);
      return new Response(JSON.stringify({ success: false, message: "DB \uC870\uD68C \uC2E4\uD328", detail: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    if (!row) {
      try {
        await db.prepare("INSERT OR IGNORE INTO admin_password (id, password) VALUES (1, ?)").bind("1234").run();
      } catch (e) {
        console.error("\uAE30\uBCF8 \uBE44\uBC00\uBC88\uD638 \uC0BD\uC785 \uC2E4\uD328:", e);
        return new Response(JSON.stringify({ success: false, message: "DB \uCD08\uAE30 \uB370\uC774\uD130 \uC0BD\uC785 \uC2E4\uD328", detail: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }
    const current = row ? row.password : "1234";
    if (password !== current) {
      return new Response(JSON.stringify({ success: false, message: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ success: true, message: "\uB85C\uADF8\uC778 \uC131\uACF5" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }
    });
  } catch (error) {
    console.error("\uAD00\uB9AC\uC790 \uB85C\uADF8\uC778 \uC624\uB958:", error);
    return new Response(JSON.stringify({ success: false, message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.", detail: String(error?.message || error) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost3, "onRequestPost");
async function onRequestOptions3(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions3, "onRequestOptions");

// api/book-consultation.js
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    const { sessionId, name, phone, email, consultationType } = await request.json();
    if (!sessionId || !name || !phone) {
      return new Response(JSON.stringify({ error: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await env["kproment2-db"].prepare(
      "INSERT INTO consultation_bookings (session_id, name, phone, email, consultation_type) VALUES (?, ?, ?, ?, ?)"
    ).bind(sessionId, name, phone, email || "", consultationType || "phone").run();
    return new Response(JSON.stringify({
      success: true,
      bookingId: result.meta.last_row_id,
      message: "\uC0C1\uB2F4 \uC608\uC57D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uACE7 \uC5F0\uB77D\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\uC0C1\uB2F4 \uC608\uC57D \uC624\uB958:", error);
    return new Response(JSON.stringify({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/generate-result.js
async function onRequestPost5(context) {
  const { request, env } = context;
  try {
    const { sessionId, answers } = await request.json();
    if (!sessionId || !answers) {
      return new Response(JSON.stringify({ error: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const loanConditions = calculateLoanConditions(answers);
    const result = await env["kproment2-db"].prepare(
      "INSERT INTO consultation_results (session_id, support_amount_min, support_amount_max, approval_probability, recommended_programs, support_summary) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      sessionId,
      loanConditions.supportAmountMin,
      loanConditions.supportAmountMax,
      loanConditions.approvalProbability,
      JSON.stringify(loanConditions.recommendedProducts),
      loanConditions.summary
    ).run();
    await env["kproment2-db"].prepare(
      "UPDATE consultation_sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?"
    ).bind("completed", sessionId).run();
    return new Response(JSON.stringify({
      success: true,
      resultId: result.meta.last_row_id,
      loanConditions
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\uC0C1\uB2F4 \uACB0\uACFC \uC0DD\uC131 \uC624\uB958:", error);
    return new Response(JSON.stringify({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost5, "onRequestPost");
function calculateLoanConditions(answers) {
  let supportAmountMin = 3e3;
  let supportAmountMax = 8e3;
  let approvalProbability = 70;
  let recommendedProducts = ["\uC815\uBD80\uC9C0\uC6D0\uC0AC\uC5C5", "\uCC3D\uC5C5\uC790\uAE08\uC9C0\uC6D0", "\uAE30\uC220\uAC1C\uBC1C\uC9C0\uC6D0"];
  let summary = "";
  const businessStatus = answers.find((a) => a.questionId === 1)?.answerText;
  if (businessStatus?.includes("\uC0AC\uC5C5\uC790 \uB4F1\uB85D \uD55C\uC801\uC5C6\uC2B5\uB2C8\uB2E4")) {
    supportAmountMin = 3e3;
    supportAmountMax = 5e3;
    approvalProbability = 90;
    recommendedProducts = ["\uC608\uBE44\uCC3D\uC5C5\uC790 \uC9C0\uC6D0\uC0AC\uC5C5", "\uC2A4\uD0C0\uD2B8\uC5C5 \uC9C0\uC6D0", "\uC815\uBD80\uC9C0\uC6D0\uC0AC\uC5C5"];
  } else if (businessStatus?.includes("3\uB144 \uBBF8\uB9CC")) {
    supportAmountMin = 5e3;
    supportAmountMax = 1e4;
    approvalProbability = 85;
    recommendedProducts = ["\uCD08\uAE30\uCC3D\uC5C5\uC790 \uC9C0\uC6D0", "\uC815\uBD80\uC9C0\uC6D0\uC0AC\uC5C5", "\uAE30\uC220\uAC1C\uBC1C\uC9C0\uC6D0"];
  } else if (businessStatus?.includes("3\uB144 \uC774\uC0C1")) {
    supportAmountMin = 3e3;
    supportAmountMax = 8e3;
    approvalProbability = 75;
    recommendedProducts = ["\uAE30\uC874\uC0AC\uC5C5\uC790 \uC9C0\uC6D0", "\uC815\uBD80\uC9C0\uC6D0\uC0AC\uC5C5", "\uAE30\uC220\uD601\uC2E0\uC9C0\uC6D0"];
  }
  const supportExperience = answers.find((a) => a.questionId === 2)?.answerText;
  if (supportExperience?.includes("\uC9C0\uC6D0\uACBD\uD5D8 \uC788\uC2B5\uB2C8\uB2E4") || supportExperience?.includes("\uD569\uACA9\uD574\uC11C \uC9C0\uC6D0\uAE08 \uBC1B\uC740\uC801\uC774 \uC788\uC2B5\uB2C8\uB2E4")) {
    approvalProbability += 15;
    supportAmountMax += 2e3;
  } else if (supportExperience?.includes("\uB4E4\uC5B4\uBCF8 \uC801 \uC788\uC2B5\uB2C8\uB2E4")) {
    approvalProbability += 5;
  }
  const businessItem = answers.find((a) => a.questionId === 3)?.answerText;
  if (businessItem?.includes("\uC0DD\uAC01\uD558\uACE0\uC788\uB294 \uC544\uC774\uD15C \uC788\uC2B5\uB2C8\uB2E4")) {
    approvalProbability += 10;
    recommendedProducts.push("\uC544\uC774\uD15C\uAC1C\uBC1C\uC9C0\uC6D0");
  }
  const region = answers.find((a) => a.questionId === 4)?.answerText;
  if (region?.includes("\uC11C\uC6B8") || region?.includes("\uC218\uB3C4\uAD8C")) {
    approvalProbability += 5;
  } else if (region?.includes("\uC81C\uC8FC") || region?.includes("\uAC15\uC6D0")) {
    approvalProbability += 10;
  }
  const loanHistory = answers.find((a) => a.questionId === 5)?.answerText;
  if (loanHistory?.includes("\uCD1D1\uCC9C\uB9CC\uC6D0 \uBBF8\uC548")) {
    approvalProbability += 10;
  } else if (loanHistory?.includes("\uCD1D1\uC5B5\uC6D0 \uC774\uC0C1")) {
    approvalProbability -= 15;
  }
  const gender = answers.find((a) => a.questionId === 6)?.answerText;
  if (gender?.includes("\uC5EC\uC131")) {
    approvalProbability += 10;
    recommendedProducts.push("\uC5EC\uC131\uCC3D\uC5C5\uC9C0\uC6D0");
  }
  const age = answers.find((a) => a.questionId === 7)?.answerText;
  if (age?.includes("\uB9CC39\uC138\uC774\uD558")) {
    approvalProbability += 15;
    recommendedProducts.push("\uCCAD\uB144\uCC3D\uC5C5\uC9C0\uC6D0");
  }
  const education = answers.find((a) => a.questionId === 8)?.answerText;
  if (education?.includes("\uB300\uD559\uC6D0 \uC878\uC5C5")) {
    approvalProbability += 10;
    recommendedProducts.push("\uACE0\uD559\uB825\uCC3D\uC5C5\uC9C0\uC6D0");
  }
  const job = answers.find((a) => a.questionId === 9)?.answerText;
  if (job?.includes("IT\uC5C5") || job?.includes("\uAE30\uC220\uC9C1")) {
    approvalProbability += 10;
    recommendedProducts.push("IT\uAE30\uC220\uC9C0\uC6D0");
  }
  approvalProbability = Math.max(30, Math.min(95, approvalProbability));
  summary = `\uC785\uB825\uD558\uC2E0 \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C ${supportAmountMin}\uB9CC\uC6D0~${supportAmountMax}\uB9CC\uC6D0 \uC815\uBD80\uC9C0\uC6D0\uC774 \uAC00\uB2A5\uD558\uBA70, \uC2B9\uC778 \uAC00\uB2A5\uC131\uC740 ${approvalProbability}%\uB85C \uCD94\uC815\uB429\uB2C8\uB2E4. \uAE30\uC220\uD2B9\uD5C8\uAC1C\uBC1C, \uC81C\uC870, IT \uC2DC\uC81C\uD488\uAC1C\uBC1C, \uC571\uC6F9\uAC1C\uBC1C\uC744 \uD3EC\uD568\uD55C \uD1A0\uD0C8 \uC6D0\uC2A4\uD1B1 \uC194\uB8E8\uC158 \uC9C0\uC6D0\uC774 \uAC00\uB2A5\uD569\uB2C8\uB2E4.`;
  return {
    supportAmountMin,
    supportAmountMax,
    approvalProbability,
    recommendedProducts,
    summary
  };
}
__name(calculateLoanConditions, "calculateLoanConditions");

// api/get-session.js
async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "\uC138\uC158 ID\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const session = await env["allinpay-db"].prepare(
      "SELECT * FROM consultation_sessions WHERE session_id = ?"
    ).bind(sessionId).first();
    if (!session) {
      return new Response(JSON.stringify({ error: "\uC138\uC158\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const answers = await env["allinpay-db"].prepare(
      "SELECT * FROM user_answers WHERE session_id = ? ORDER BY created_at"
    ).bind(sessionId).all();
    const result = await env["allinpay-db"].prepare(
      "SELECT * FROM consultation_results WHERE session_id = ?"
    ).bind(sessionId).first();
    const booking = await env["allinpay-db"].prepare(
      "SELECT * FROM consultation_bookings WHERE session_id = ?"
    ).bind(sessionId).first();
    return new Response(JSON.stringify({
      success: true,
      session,
      answers: answers.results || [],
      result,
      booking
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\uC138\uC158 \uC870\uD68C \uC624\uB958:", error);
    return new Response(JSON.stringify({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet, "onRequestGet");

// api/save-answer.js
async function onRequestPost6(context) {
  return handleRequest(context);
}
__name(onRequestPost6, "onRequestPost");
async function onRequestOptions4(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions4, "onRequestOptions");
async function handleRequest(context) {
  const { request, env } = context;
  try {
    console.log("=== \uB2F5\uBCC0 \uC800\uC7A5 API \uD638\uCD9C\uB428 ===");
    console.log("env \uAC1D\uCCB4:", env);
    console.log("env.DB \uC874\uC7AC:", !!env.DB);
    console.log("env.DB \uD0C0\uC785:", typeof env.DB);
    let db = env["kproment2-db"];
    console.log("kproment2-db \uBC14\uC778\uB529 \uC874\uC7AC:", !!db);
    if (!db) {
      console.error("kproment2-db \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uAC00 \uBC14\uC778\uB529\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4!");
      console.log("\uC0AC\uC6A9 \uAC00\uB2A5\uD55C env \uD0A4\uB4E4:", Object.keys(env));
      return new Response(JSON.stringify({
        error: "kproment2-db \uB370\uC774\uD130\uBCA0\uC774\uC2A4\uAC00 \uBC14\uC778\uB529\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
        availableKeys: Object.keys(env),
        suggestion: "Cloudflare Pages\uC5D0\uC11C D1 \uBC14\uC778\uB529\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694."
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    const body = await request.json();
    console.log("\uC694\uCCAD \uB370\uC774\uD130:", body);
    const { sessionId, questionId, questionText, answerText, answerCategory } = body;
    const questionIdInt = parseInt(questionId);
    if (!sessionId || !questionIdInt || !answerText) {
      console.log("\uD544\uC218 \uD544\uB4DC \uB204\uB77D:", { sessionId, questionId: questionIdInt, answerText });
      return new Response(JSON.stringify({ error: "\uD544\uC218 \uD544\uB4DC\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("\uD14C\uC774\uBE14 \uC874\uC7AC \uD655\uC778 \uC911...");
    const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("\uD604\uC7AC \uD14C\uC774\uBE14:", tables.results);
    const tableNames = tables.results.map((t) => t.name);
    if (!tableNames.includes("consultation_sessions")) {
      console.log("consultation_sessions \uD14C\uC774\uBE14 \uC0DD\uC131 \uC911...");
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS consultation_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'in_progress' 
        )
      `).run();
    }
    if (!tableNames.includes("user_answers")) {
      console.log("user_answers \uD14C\uC774\uBE14 \uC0DD\uC131 \uC911...");
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS user_answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          question_id INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          answer_text TEXT NOT NULL,
          answer_category TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
        )
      `).run();
    }
    console.log("\uC138\uC158 \uD655\uC778 \uC911...");
    const sessionResult = await db.prepare(
      "SELECT id FROM consultation_sessions WHERE session_id = ?"
    ).bind(sessionId).first();
    console.log("\uC138\uC158 \uACB0\uACFC:", sessionResult);
    if (!sessionResult) {
      console.log("\uC0C8 \uC138\uC158 \uC0DD\uC131 \uC911...");
      await db.prepare(
        "INSERT INTO consultation_sessions (session_id, status) VALUES (?, ?)"
      ).bind(sessionId, "in_progress").run();
      console.log("\uC138\uC158 \uC0DD\uC131 \uC644\uB8CC");
    }
    console.log("\uB2F5\uBCC0 \uC800\uC7A5 \uC911...");
    const result = await db.prepare(
      "INSERT INTO user_answers (session_id, question_id, question_text, answer_text, answer_category) VALUES (?, ?, ?, ?, ?)"
    ).bind(sessionId, questionIdInt, questionText, answerText, answerCategory).run();
    console.log("\uC800\uC7A5 \uACB0\uACFC:", result);
    return new Response(JSON.stringify({
      success: true,
      answerId: result.meta.last_row_id,
      message: "\uB2F5\uBCC0\uC774 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("=== \uB2F5\uBCC0 \uC800\uC7A5 \uC624\uB958 ===");
    console.error("\uC5D0\uB7EC \uBA54\uC2DC\uC9C0:", error.message);
    console.error("\uC5D0\uB7EC \uC2A4\uD0DD:", error.stack);
    console.error("\uC804\uCCB4 \uC5D0\uB7EC:", error);
    return new Response(JSON.stringify({
      error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(handleRequest, "handleRequest");

// api/send-verification.js
async function onRequestPost7(context) {
  const { request, env } = context;
  try {
    const { sessionId, phoneNumber } = await request.json();
    if (!phoneNumber || phoneNumber.length !== 11) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uC62C\uBC14\uB978 \uD734\uB300\uD3F0\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const verificationCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const SOLAPI_API_KEY = env.SOLAPI_API_KEY || "NCSXSG86GBJ31VDX";
    const SOLAPI_API_SECRET = env.SOLAPI_API_SECRET || "WIMT8DAV6UTPM9XDG1KDEBINQVB4Z2FT";
    const SOLAPI_SENDER = env.SOLAPI_SENDER || "01099820085";
    console.log("API \uD0A4 \uD655\uC778:", {
      hasKey: !!SOLAPI_API_KEY,
      hasSecret: !!SOLAPI_API_SECRET,
      sender: SOLAPI_SENDER
    });
    if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
      console.error("\uC194\uB77C\uD53C API \uD0A4\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBE44\uC2A4 \uC124\uC815 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const requestBody = {
      message: {
        to: phoneNumber,
        from: SOLAPI_SENDER,
        text: `[\uCF00\uC774\uD504\uB85C\uBA3C\uD2B8] \uC778\uC99D\uBC88\uD638: ${verificationCode}
\uC815\uBD80\uC815\uCC45\uC9C0\uC6D0 \uC0C1\uB2F4\uC744 \uC704\uD55C \uC778\uC99D\uBC88\uD638\uC785\uB2C8\uB2E4.`
      }
    };
    const solapiUrl = "https://api.solapi.com/messages/v4/send";
    let authorizationHeader = "";
    try {
      const date = (/* @__PURE__ */ new Date()).toISOString();
      const salt = crypto.randomUUID();
      async function hmacSha256Hex(secret, message) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
        const bytes = new Uint8Array(signatureBuffer);
        return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      __name(hmacSha256Hex, "hmacSha256Hex");
      const signature = await hmacSha256Hex(SOLAPI_API_SECRET, date + salt);
      authorizationHeader = `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
    } catch (authErr) {
      console.error("HMAC \uC11C\uBA85 \uC0DD\uC131 \uC2E4\uD328:", authErr);
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC778\uC99D \uAD6C\uC131 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
        detail: String(authErr?.message || authErr)
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    console.log("\uC194\uB77C\uD53C API \uC694\uCCAD:", {
      url: solapiUrl,
      headers: {
        Authorization: authorizationHeader,
        "Content-Type": "application/json"
      },
      body: requestBody
    });
    let solapiResponse;
    try {
      solapiResponse = await fetch(solapiUrl, {
        method: "POST",
        headers: {
          Authorization: authorizationHeader,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(requestBody)
      });
    } catch (netErr) {
      console.error("\uC194\uB77C\uD53C \uB124\uD2B8\uC6CC\uD06C \uC624\uB958:", netErr);
      return new Response(JSON.stringify({
        success: false,
        message: "\uBB38\uC790 \uBC1C\uC1A1 \uC11C\uBC84 \uC5F0\uACB0\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
        detail: String(netErr?.message || netErr)
      }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    console.log("\uC194\uB77C\uD53C API \uC751\uB2F5 \uC0C1\uD0DC:", solapiResponse.status);
    if (!solapiResponse.ok) {
      const errorText = await solapiResponse.text();
      console.error("\uC194\uB77C\uD53C API \uC624\uB958:", {
        status: solapiResponse.status,
        statusText: solapiResponse.statusText,
        error: errorText
      });
      return new Response(JSON.stringify({
        success: false,
        message: `\uC778\uC99D\uBC88\uD638 \uBC1C\uC1A1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. (${solapiResponse.status}: ${solapiResponse.statusText})`,
        detail: errorText
      }), {
        status: solapiResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    const responseData = await solapiResponse.json();
    console.log("\uC194\uB77C\uD53C API \uC131\uACF5 \uC751\uB2F5:", responseData);
    const verificationData = {
      sessionId,
      phoneNumber,
      verificationCode,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      expiresAt: new Date(Date.now() + 3 * 60 * 1e3).toISOString()
      // 3분 후 만료
    };
    if (!env.VERIFICATION_CODES || typeof env.VERIFICATION_CODES.put !== "function") {
      console.error("KV \uBC14\uC778\uB529 \uB204\uB77D: VERIFICATION_CODES\uAC00 \uC815\uC758\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC124\uC815 \uC624\uB958: \uC778\uC99D\uBC88\uD638 \uC800\uC7A5\uC18C\uAC00 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
        detail: "Cloudflare Pages \uD504\uB85C\uC81D\uD2B8\uC5D0 KV \uBC14\uC778\uB529(VERIFICATION_CODES)\uC744 \uC5F0\uACB0\uD558\uC138\uC694."
      }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    try {
      await env.VERIFICATION_CODES.put(
        `${sessionId}_${phoneNumber}`,
        JSON.stringify(verificationData),
        { expirationTtl: 180 }
        // 3분 TTL
      );
    } catch (kvErr) {
      console.error("KV \uC800\uC7A5 \uC2E4\uD328:", kvErr);
      return new Response(JSON.stringify({
        success: false,
        message: "\uC778\uC99D\uBC88\uD638 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.",
        detail: String(kvErr?.message || kvErr)
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: "\uC778\uC99D\uBC88\uD638\uAC00 \uBC1C\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("\uC778\uC99D\uBC88\uD638 \uBC1C\uC1A1 \uC624\uB958(\uD578\uB4E4\uB418\uC9C0 \uC54A\uC740 \uC608\uC678):", error);
    return new Response(JSON.stringify({
      success: false,
      message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.",
      detail: String(error?.message || error)
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(onRequestPost7, "onRequestPost");
async function onRequestOptions5(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions5, "onRequestOptions");

// api/test-db.js
async function onRequestPost8(context) {
  const { request, env } = context;
  try {
    console.log("=== \uD14C\uC2A4\uD2B8 API \uD638\uCD9C\uB428 ===");
    console.log("env \uAC1D\uCCB4:", Object.keys(env));
    console.log("allinpay-db \uBC14\uC778\uB529:", !!env["allinpay-db"]);
    if (env["allinpay-db"]) {
      const testResult = await env["allinpay-db"].prepare("SELECT 1 as test").first();
      console.log("\uD14C\uC2A4\uD2B8 \uCFFC\uB9AC \uC131\uACF5:", testResult);
      return new Response(JSON.stringify({
        success: true,
        message: "D1 \uC5F0\uACB0 \uC131\uACF5",
        testResult
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } else {
      return new Response(JSON.stringify({
        error: "D1 \uBC14\uC778\uB529 \uC2E4\uD328",
        availableKeys: Object.keys(env)
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  } catch (error) {
    console.error("\uD14C\uC2A4\uD2B8 API \uC624\uB958:", error);
    return new Response(JSON.stringify({
      error: "\uD14C\uC2A4\uD2B8 \uC2E4\uD328",
      details: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
__name(onRequestPost8, "onRequestPost");

// api/verify-code.js
async function onRequestPost9(context) {
  const { request, env } = context;
  try {
    const { sessionId, phoneNumber, verificationCode } = await request.json();
    if (!sessionId || !phoneNumber || !verificationCode) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uD544\uC218 \uC815\uBCF4\uAC00 \uB204\uB77D\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!env.VERIFICATION_CODES || typeof env.VERIFICATION_CODES.get !== "function") {
      console.error("KV \uBC14\uC778\uB529 \uB204\uB77D \uB610\uB294 \uC624\uD0C0: VERIFICATION_CODES");
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC124\uC815 \uC624\uB958: \uC778\uC99D\uBC88\uD638 \uC800\uC7A5\uC18C(VERIFICATION_CODES)\uAC00 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!env.VERIFIED_PHONES || typeof env.VERIFIED_PHONES.put !== "function") {
      console.error("KV \uBC14\uC778\uB529 \uB204\uB77D \uB610\uB294 \uC624\uD0C0: VERIFIED_PHONES");
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC124\uC815 \uC624\uB958: \uC778\uC99D \uC0C1\uD0DC \uC800\uC7A5\uC18C(VERIFIED_PHONES)\uAC00 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."
      }), {
        status: 503,
        headers: { "Content-Type": "application/json" }
      });
    }
    let storedData;
    try {
      storedData = await env.VERIFICATION_CODES.get(`${sessionId}_${phoneNumber}`);
    } catch (kvGetErr) {
      console.error("VERIFICATION_CODES.get \uC2E4\uD328:", kvGetErr);
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC800\uC7A5\uC18C \uC870\uD68C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!storedData) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uC778\uC99D\uBC88\uD638\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uAC70\uB098 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const verificationData = JSON.parse(storedData);
    if (/* @__PURE__ */ new Date() > new Date(verificationData.expiresAt)) {
      try {
        await env.VERIFICATION_CODES.delete(`${sessionId}_${phoneNumber}`);
      } catch (kvDelErr) {
        console.error("VERIFICATION_CODES.delete \uC2E4\uD328(\uB9CC\uB8CC \uCC98\uB9AC):", kvDelErr);
      }
      return new Response(JSON.stringify({
        success: false,
        message: "\uC778\uC99D\uBC88\uD638\uAC00 \uB9CC\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uBC1C\uC1A1\uD574\uC8FC\uC138\uC694."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (verificationData.verificationCode !== verificationCode) {
      return new Response(JSON.stringify({
        success: false,
        message: "\uC778\uC99D\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      await env.VERIFIED_PHONES.put(sessionId, JSON.stringify({
        phoneNumber,
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
      }), { expirationTtl: 3600 });
    } catch (kvPutErr) {
      console.error("VERIFIED_PHONES.put \uC2E4\uD328:", kvPutErr);
      return new Response(JSON.stringify({
        success: false,
        message: "\uC11C\uBC84 \uC800\uC7A5\uC18C \uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    try {
      await env.VERIFICATION_CODES.delete(`${sessionId}_${phoneNumber}`);
    } catch (kvDelErr2) {
      console.error("VERIFICATION_CODES.delete \uC2E4\uD328(\uC0AC\uC6A9 \uD6C4 \uC815\uB9AC):", kvDelErr2);
    }
    return new Response(JSON.stringify({
      success: true,
      message: "\uC778\uC99D\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("\uC778\uC99D\uBC88\uD638 \uAC80\uC99D \uC624\uB958:", error);
    return new Response(JSON.stringify({
      success: false,
      message: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4."
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  }
}
__name(onRequestPost9, "onRequestPost");
async function onRequestOptions6(context) {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions6, "onRequestOptions");

// ../.wrangler/tmp/pages-4INCAV/functionsRoutes-0.8209295744004936.mjs
var routes = [
  {
    routePath: "/api/admin-change-password",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/admin-change-password",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin-inquiries",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/admin-inquiries",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/admin-login",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions3]
  },
  {
    routePath: "/api/admin-login",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/book-consultation",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/generate-result",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/get-session",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/save-answer",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions4]
  },
  {
    routePath: "/api/save-answer",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/send-verification",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions5]
  },
  {
    routePath: "/api/send-verification",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/test-db",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/api/verify-code",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions6]
  },
  {
    routePath: "/api/verify-code",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost9]
  }
];

// ../../../Users/사용자/AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../Users/사용자/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
