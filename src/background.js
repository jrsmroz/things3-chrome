async function savePageToThings(info, tab) {
    await addToThings(tab, () => tab.url.toString());
}

async function saveSelectionToThings(info, tab) {
    await addToThings(tab, async () => {
        const [{ result: selection }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            func: () => document.getSelection().toString(),
        });
        return selection;
    });
}

async function saveLinkToThings(info, tab) {
    await addToThings(tab, () => `${info.linkUrl}\n${tab.url}`);
}

async function addToThings(tab, getNoteFn) {
    try {
        const title = encodeURIComponent(tab.title);
        const note = encodeURIComponent(await getNoteFn());
        const xCallbackUrl = `things:///add?show-quick-entry=true&title=${title}&notes=${note}`;
        chrome.tabs.update({ url: xCallbackUrl });
    }
    catch (error) {
        console.error("Error adding to Things:", error);
    }
}

chrome.action.onClicked.addListener(async (tab) => {
    savePageToThings(null, tab);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    let actions = {
        "saveLinkToThings": saveLinkToThings,
        "saveSelectionToThings": saveSelectionToThings,
        "savePageToThings": savePageToThings
    };
    actions[info.menuItemId](info, tab);
});


 chrome.contextMenus.removeAll(() => {

    chrome.contextMenus.create({
        id: "saveLinkToThings",
        title: chrome.i18n.getMessage("saveLinkToThings"),
        contexts: ["link"],
    });

    chrome.contextMenus.create({
        id: "saveSelectionToThings",
        title: chrome.i18n.getMessage("saveSelectionToThings"),
        contexts: ["selection"],
    });

    chrome.contextMenus.create({
        id: "savePageToThings",
        title: chrome.i18n.getMessage("savePageToThings"),
        contexts: ["page"],
    });

});
