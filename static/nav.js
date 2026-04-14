// API
document.writeln("<link rel='stylesheet' href='../static/bootstrap.min.css'>");
document.writeln("<script src='../static/vue.global.prod.js'></script>");
document.writeln("<script src='../static/popper.min.js'></script>");
document.writeln("<script src='../static/bootstrap.min.js'></script>");
//

document.writeln("<style>");
document.writeln("  .nav-link {");
document.writeln("    transition: transform 0.3s, opacity 0.3s;");
document.writeln("  }");
document.writeln("  .nav-link:hover {");
document.writeln("    transform: translateY(-5px);");
document.writeln("    opacity: 0.8;");
document.writeln("  }");
document.writeln("</style>");

document.writeln("<!-- 上方bar -->");
document.writeln("<nav class='navbar navbar-expand-lg mx-5 mb-3'>");
document.writeln("  <div class='container-fluid'>");
document.writeln(
  "    <a class='navbar-brand p-3 nav-text' href='page.html'>SignReader</a>"
);
document.writeln("    <button");
document.writeln("      class='navbar-toggler'");
document.writeln("      type='button'");
document.writeln("      data-bs-toggle='collapse'");
document.writeln("      data-bs-target='#navbarNavAltMarkup'");
document.writeln("      aria-controls='navbarNavAltMarkup'");
document.writeln("      aria-expanded='false'");
document.writeln("      aria-label='Toggle navigation'");
document.writeln("    >");
document.writeln("      <span class='navbar-toggler-icon'></span>");
document.writeln("    </button>");
document.writeln(
  "    <div class='collapse navbar-collapse'  id='navbarNavAltMarkup'>"
);
document.writeln("      <div class='navbar-nav' >");
document.writeln(
  "        <a class='nav-link nav-text' aria-current='page' href='book_upNav.html'>電「指」書</a>"
);
document.writeln(
  "        <a class='nav-link nav-text' href='card.html'>情境練習</a>"
);
document.writeln(
  "        <a class='nav-link nav-text' href='cardTest.html'>精熟程度測驗</a>"
);
// document.writeln(
//   "        <a class='nav-link nav-text' href='#'>使用者資料</a>"
// );
document
  .writeln
  // "        <a class='nav-link nav-text' href='home.html'>登出</a>"
  ();
document.writeln("      </div>");
document.writeln("    </div>");
document.writeln("  </div>");
document.writeln("</nav>");
document.writeln("");
