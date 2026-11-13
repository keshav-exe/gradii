/** Where the visitor's choice is kept. Absent means follow the system. */
export const THEME_KEY = "theme"

/**
 * Sets `.dark` on <html> before first paint, from the saved choice or the
 * system setting, and keeps following the system while nothing is saved.
 */
export const THEME_BOOT = `try{var k="${THEME_KEY}",m=matchMedia("(prefers-color-scheme: dark)"),a=function(){var t=localStorage.getItem(k);document.documentElement.classList.toggle("dark",t?t==="dark":m.matches)};a();m.addEventListener("change",a)}catch(e){}`
