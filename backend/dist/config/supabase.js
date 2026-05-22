"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.log("Supabase env variables not set");
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl || '', supabaseKey || '');
exports.default = supabase;
