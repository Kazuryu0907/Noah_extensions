window.addEventListener('load', () => {
  document.getElementById("button")?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if(!tabs[0].id){console.log("There is no tabs");return;}
      chrome.tabs.sendMessage(tabs[0].id, { type: "Click_button" }).catch(e => console.error(e));
    });
  }, false);

  chrome.runtime.onConnect.addListener(port => {
    const buttonElm = document.getElementById("button");
    if(!buttonElm?.textContent) return;
    buttonElm.textContent = "読み込み中（0）人...";
    port.onMessage.addListener(message => {
      if(message.size)buttonElm.textContent = `読み込み中（${message.size}）人...`;
      console.log(message);
    });
  });
});