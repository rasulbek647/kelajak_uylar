"use client";

import { useServerInsertedHTML } from "next/navigation";

// Default light, localStorage dan o'qiymiz
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.remove('dark')}})()`;

export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_INIT }}
    />
  ));

  return null;
}
