 function textSplitter(element) {
  const original = element.textContent;
  const words = original.trim().split(/\s+/);

  element.innerHTML = "";

  const lineContainer = document.createElement("div");
  lineContainer.style.display = "inline-block";
  element.appendChild(lineContainer);

  const lines = [];
  const wordsEls = [];
  const charsEls = [];

  let currentLine = document.createElement("div");
  currentLine.className = "lineH1";
  currentLine.style.whiteSpace = "nowrap";
  lineContainer.appendChild(currentLine);
  lines.push(currentLine);

  words.forEach((word, wi) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "wordH";
    wordSpan.style.display = "inline-block";

    // Build characters
    word.split("").forEach(c => {
      const charSpan = document.createElement("span");
      charSpan.className = "charH";
      charSpan.style.display = "inline-block";
      charSpan.textContent = c;
      wordSpan.appendChild(charSpan);
      charsEls.push(charSpan);
    });

    wordsEls.push(wordSpan);
    currentLine.appendChild(wordSpan);

    // Detect line wrap
    const testTop = wordSpan.offsetTop;
    const currentTop = currentLine.offsetTop;

    if (testTop > currentTop) {
      currentLine = document.createElement("div");
      currentLine.className = "lineH1";
      currentLine.style.whiteSpace = "nowrap";
      lineContainer.appendChild(currentLine);
      lines.push(currentLine);
      currentLine.appendChild(wordSpan);
    }

    // Add space between words
    if (wi < words.length - 1) {
      const space = document.createTextNode(" ");
      currentLine.appendChild(space);
    }
  });

  return { chars: charsEls, words: wordsEls, lines };
}