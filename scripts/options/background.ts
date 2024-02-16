chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    let rule = {
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { originAndPathMatches: "https://twitter.com/*/following" }
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction(),new chrome.declarativeContent.ShowAction()],
    };
    chrome.declarativeContent.onPageChanged.addRules([rule]);

  });
});