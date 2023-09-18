//const API_URL = "https://api-server-5.glitch.me/api/bookmarks";
const API_URL = "http://localhost:5000/api/bookmarks";
function API_GetContacts() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            success: bookmarks => { resolve(bookmarks); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetContact(bookmarkId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + bookmarkId,
            success: bookmark => { resolve(bookmark); },
            error: () => { resolve(null); }
        });
    });
}
function API_SaveContact(bookmark, create) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(bookmark),
            success: (/*data*/) => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}
function API_DeleteContact(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + id,
            type: "DELETE",
            success: () => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}