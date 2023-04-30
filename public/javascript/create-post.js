async function createPostHandler(event) {
    event.preventDefault();

    document.location.replace('/dasboard/new');
}

document.querySelector('#create-new-post').addEventListener('click', createPostHandler);