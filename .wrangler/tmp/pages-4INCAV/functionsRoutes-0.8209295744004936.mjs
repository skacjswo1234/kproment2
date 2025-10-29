import { onRequestOptions as __api_admin_change_password_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\admin-change-password.js"
import { onRequestPost as __api_admin_change_password_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\admin-change-password.js"
import { onRequestOptions as __api_admin_inquiries_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\admin-inquiries.js"
import { onRequestPost as __api_admin_inquiries_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\admin-inquiries.js"
import { onRequestOptions as __api_admin_login_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\admin-login.js"
import { onRequestPost as __api_admin_login_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\admin-login.js"
import { onRequestPost as __api_book_consultation_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\book-consultation.js"
import { onRequestPost as __api_generate_result_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\generate-result.js"
import { onRequestGet as __api_get_session_js_onRequestGet } from "C:\\cursor\\kproment2\\functions\\api\\get-session.js"
import { onRequestOptions as __api_save_answer_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\save-answer.js"
import { onRequestPost as __api_save_answer_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\save-answer.js"
import { onRequestOptions as __api_send_verification_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\send-verification.js"
import { onRequestPost as __api_send_verification_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\send-verification.js"
import { onRequestPost as __api_test_db_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\test-db.js"
import { onRequestOptions as __api_verify_code_js_onRequestOptions } from "C:\\cursor\\kproment2\\functions\\api\\verify-code.js"
import { onRequestPost as __api_verify_code_js_onRequestPost } from "C:\\cursor\\kproment2\\functions\\api\\verify-code.js"

export const routes = [
    {
      routePath: "/api/admin-change-password",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_admin_change_password_js_onRequestOptions],
    },
  {
      routePath: "/api/admin-change-password",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_change_password_js_onRequestPost],
    },
  {
      routePath: "/api/admin-inquiries",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_admin_inquiries_js_onRequestOptions],
    },
  {
      routePath: "/api/admin-inquiries",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_inquiries_js_onRequestPost],
    },
  {
      routePath: "/api/admin-login",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_admin_login_js_onRequestOptions],
    },
  {
      routePath: "/api/admin-login",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_login_js_onRequestPost],
    },
  {
      routePath: "/api/book-consultation",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_book_consultation_js_onRequestPost],
    },
  {
      routePath: "/api/generate-result",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_result_js_onRequestPost],
    },
  {
      routePath: "/api/get-session",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_get_session_js_onRequestGet],
    },
  {
      routePath: "/api/save-answer",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_save_answer_js_onRequestOptions],
    },
  {
      routePath: "/api/save-answer",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_save_answer_js_onRequestPost],
    },
  {
      routePath: "/api/send-verification",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_send_verification_js_onRequestOptions],
    },
  {
      routePath: "/api/send-verification",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_verification_js_onRequestPost],
    },
  {
      routePath: "/api/test-db",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_test_db_js_onRequestPost],
    },
  {
      routePath: "/api/verify-code",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_verify_code_js_onRequestOptions],
    },
  {
      routePath: "/api/verify-code",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_verify_code_js_onRequestPost],
    },
  ]