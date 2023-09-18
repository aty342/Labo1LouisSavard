//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderContacts();
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderContacts();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");

    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Louis Savard
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
$(document).ready(function() {
    $("#loginCmd").click(function() {
        renderContacts();
    });
});

async function renderContacts(categorie = null) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    let bookmarks = await API_GetContacts();
    eraseContent();
    renderCategories(bookmarks, categorie);
    if(categorie != null)
        bookmarks = bookmarks.filter(bookmark => bookmark.Catégorie === categorie);
    
    if (bookmarks !== null) {
        
        bookmarks.forEach(bookmark => {
            $("#content").append(renderContact(bookmark));
        });
        restoreContentScrollPosition();
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateContactForm() {
    renderContactForm();
}
async function renderEditContactForm(id) {
    showWaitingGif();
    let bookmark = await API_GetContact(id);
    if (bookmark !== null)
        renderContactForm(bookmark);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetContact(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${bookmark.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <img id="webSiteIcon" src="https://www.google.com/s2/favicons?domain=${bookmark.Url}" class="appLogo" alt="" title="Logo de la page Web">
                        <div class="contactTitre">${bookmark.Titre}</div>
                        <a href="${bookmark.Url}"><div class="contactCategorie">${bookmark.Catégorie}</div></a>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteContact(bookmark.Id);
            if (result)
                renderContacts();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderContacts();
        });
    } else {
        renderError("Contact introuvable!");
    }
}
function newContact() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Titre = "";
    bookmark.Url = "";
    bookmark.Catégorie = "";
    return bookmark;
}

function renderContactForm(bookmark = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newContact(); //catégorie = newCatégorie();
    let logo = "bookmarkfavoris.png";

    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
    <form class="form" id="contactForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            <img id="webSiteIcon" src="${logo}" class="appLogo" alt="" title="Logo de la page Web">
            <label for="Titre" class="form-label"><b>Titre</b> </label>
            <input 
                class="form-control Alpha"
                name="Titre" 
                id="Titre" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un Titre"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${bookmark.Titre}"
            />
            <label for="Url" class="form-label"><b>Url</b> </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer l'url du site" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.Url}" 
            />
            <label for="Catégorie" class="form-label"><b>Catégorie</b> </label>
            <input 
                class="form-control Catégorie"
                name="Catégorie"
                id="Catégorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une Catégorie" 
                InvalidMessage="Veuillez entrer une Catégorie valide"
                value="${bookmark.Catégorie}"
                
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    if(!create)
        $("#webSiteIcon").attr("src",`https://www.google.com/s2/favicons?domain=${bookmark.Url}`);
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#contactForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveContact(bookmark, create)
        if (result)
            renderContacts();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderContacts();
    });
    $('#Url').on("input", function()
    {
        let $flaviconsImage = $("#webSiteIcon")
        let $inputUrl = $("#Url").val();
        if($inputUrl == "") 
            $flaviconsImage.attr("src",`bookmarkfavoris.png`);
        else
            $flaviconsImage.attr("src",`https://www.google.com/s2/favicons?domain=${$inputUrl}`);
    })
    
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderContact(bookmark) {
    return $(`
    <div class="contactRow" contact_id=${bookmark.Id}">
        <div class="contactContainer">
            <div class="contactLayout">
                <img src="https://www.google.com/s2/favicons?domain=${bookmark.Url}">
                <span class="contactTitre">${bookmark.Titre}</span>
                <br>
                <a href="${bookmark.Url}"><span class="contactCategorie">${bookmark.Catégorie}</span></a>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${bookmark.Id}" title="Modifier ${bookmark.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${bookmark.Id}" title="Effacer ${bookmark.Titre}"></span>
            </ div>
        </div>
    </div>           
    `);
}

function renderCategories(bookmarks, categorie) {
    const dropDownMenu = $(".listeCategories");
    dropDownMenu.empty();
    let listeCategories = [];
    if (bookmarks.length > 0) {
        bookmarks.forEach(bookmark => {
            if (!listeCategories.includes(bookmark.Catégorie)) {
                const categoryId = bookmark.Catégorie.replace(/\s/g, '_');
                if(categorie == bookmark.Catégorie)
                    dropDownMenu.append(`<div class="dropdown-item" id="${categoryId}categorie"> ${bookmark.Catégorie} <i class="fas fa-check"></i></div>`);
                else
                    dropDownMenu.append(`<div class="dropdown-item" id="${categoryId}categorie"> ${bookmark.Catégorie}</div>`);
                $(`#${categoryId}categorie`).on("click", function () {
                    renderContacts(bookmark.Catégorie);
                });
                listeCategories.push(bookmark.Catégorie);   
            }
        });
    }
}
