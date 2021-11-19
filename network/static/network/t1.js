document.addEventListener('DOMContentLoaded', function () {

    window.addEventListener("popstate", function (event){
        alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
        console.log(history.state);
        //show_posts(history.state);
    });

    const path = window.location.pathname.split('/')[1];

    if (! "profile" == path) { //check if profile in path
        var el = document.getElementById('submit-btn'); //skam nevoj per ket because of if
        if (el) {
            el.addEventListener('click', check_post);
        }
        show_posts('all');
    }
    else {
        const username = window.location.pathname.split('/')[2];
        //show_posts(username);

        let followed = username;
        let follower = document.getElementById("current-user").getAttribute("value");

        let f = document.getElementById('follow-btn'); //skam nevoj per ket because of if
        if (f) {
            let follow = follow_btn(follower, followed);
            f.addEventListener('click', () => { 
                follow_state(follower, followed, follow)
            });
        }

    }
    const url = window.location.origin.split('/')[1];

    document.querySelector('#all-posts').addEventListener('click', () => {
        history.pushState("all", "", url + "/all-posts");
        show_posts('all-posts');
    });

    let following = document.getElementById('followed-posts'); //skam nevoj per ket because of if
        if (following) {
            following.addEventListener('click', () => {
                history.pushState("following", "", url + "/following");
                show_posts('followed');
            });
        }

    //let r = pagination(state.querySet, state.page, state.posts);
    //pageButtons(r.pages, state);
    //postsPerPage(state);

});


function check_post() {

    const content = document.querySelector('#text-post');
    event.preventDefault();

    if (content.value.length === 0) {
        alert("Post is empty.");
    }
    else if (content.value.length > 400) {
        alert("Post is too long.");
    }
    else {
        const csrftoken = Cookies.get('csrftoken');

        fetch('api/post-create/', {
            method: 'POST',
            headers: {
                "X-CSRFToken": csrftoken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content.value
            })
        })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log("RESULT:", result);
            });

        content.value = "";

        username = document.getElementById('username').getAttribute('value');
        console.log(username);

        fetch(`api/last-post/${username}`)
            .then(response => response.json())
            .then(post => {
                console.log(post);
            });

        fetch(`api/last-post/${username}`)
            .then(response => response.json())
            .then(post => {
                console.log(post);
                update_posts(post, 'update');
            });

    }
}

function show_posts(sort) {

    if(sort === "all-posts" || sort === "followed") { //or check the link for profile or empty
        if (sort === "all-posts") {
            sort = "all";
        }

        let writePost = document.getElementById('new-post-view'); //skam nevoj per ket because of if
        if (writePost) {
            writePost.style.display = 'none';
        }

        let profile = document.getElementById('user-profile'); //skam nevoj per ket because of if
        if (profile) {
            profile.style.display = 'none';
        }
    }
    let url = "";
    const domain = window.location.origin;

    let elements = document.getElementById('posts-view').getElementsByClassName('post-dv'); //problem when  creating new post
            
    while(elements.length){
        elements[0].parentNode.removeChild(elements[0]);
    }

    if (sort === "all")  {
        url = domain + "/api/post-list/?page1";
    }
    else {
        url = domain + "/api/post-list/" + sort;
    }

    fetch_posts(url);
}

function fetch_posts(url) {

    sort = "all";
    fetch(url)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        posts["data"].forEach(post => update_posts(post, sort));
        
        posts["total_pages"] =  Math.ceil(posts["total_pages"]);
        posts["window"] = 5;
        console.log(posts);
    //let r = pagination(state.querySet, state.page, state.posts);
    pageButtons(posts);
  
    }); 
}


function fetching(posts) {
    let url =  window.location.origin + "/api/post-list/?page" + posts["current_page"];

    fetch(posts["next"])
    .then(response => response.json())
    .then(posts => {
        posts["data"].forEach(post => update_posts(post, sort));

        posts["total_pages"] =  Math.ceil(posts["total_pages"]);
        posts["window"] = 5;
        console.log(posts);

        return posts;
  
    }); 
}


function update_posts(post, sort) {

    const element = document.createElement('div');
    element.setAttribute("class", "post-dv");

    var path = window.location.pathname.split('/')[1];
    
    if (! "profile" == path) {
        element.innerHTML += "Author: " + '<a href="profile/'+post.poster+'">'+post.poster+'</a>' + "<br>"; //link("profile/" + post.author) +
    }
    element.innerHTML += "Content: " + post.content + "<br>";
    element.innerHTML += "Date: " + post.date_posted + "<br>";
    element.innerHTML += "Likes: 0"  + "<br>"; //fetch nr of likes tbh

    element.style.border = "groove";
    element.style.margin = "10px";
    element.style.color = "black";


    if (sort === 'update') {
        var item = document.querySelector('#posts-view');
        item.insertBefore(element, item.firstChild);
    }
    else {
        document.querySelector('#posts-view').append(element);
    }

}


function follow_state(follower, followed, follow) {

    const url = window.location.origin + "/api/follow-state/" + follower + "/" + followed;
    const csrftoken = Cookies.get('csrftoken');

    fetch(url, {
        method: 'PUT',
        headers: {
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            follower: follower,
            followed: followed,
            follow: follow
        })
    })
    .then(response => follow_btn(follower, followed))
}


function follow_btn(follower, followed) {
    
    fetch(`/api/follow-state/${follower}/${followed}`)
    .then(response => response.json())
    .then(f => {
        let following = f["following"];
        var btn = document.getElementById("follow-btn");

        if (following === true) {
            btn.innerHTML = "Unfollow"
        }
        else {
            btn.innerHTML = "Follow"
        }

        console.log(following);

        return following;
    });
}


function pagination(querySet, page, posts) {
    var trimStart = (page - 1) * posts;
    var trimEnd = trimStart + posts;

    var trimmedData = querySet.slice(trimStart, trimEnd)

    var pages = Math.floor(querySet.length / posts); // or celing?

    return {
        'querySet': trimmedData,
        'pages': pages,
    }
}


function pageButtons(posts) {
    var wrapper = document.getElementById('pagination-wrapper');

    wrapper.innerHTML = ``;
	console.log('Pages:', posts["total_pages"]);

    var maxLeft = (posts["current_page"] - Math.floor(posts["window"] / 2));
    var maxRight = (posts["current_page"] + Math.floor(posts["window"] / 2));

    if (maxLeft < 1) {
        maxLeft = 1;
        maxRight = posts["window"];
    }

    if (maxRight > posts["total_pages"]) {
        maxLeft = posts["total_pages"] - (posts["window"] - 1);
        
        if (maxLeft < 1){
        	maxLeft = 1;
        }
        maxRight = posts["total_pages"];
        console.log('pages:', maxRight);
    }
    
    for (var page = maxLeft; page <= maxRight; page++) {
        wrapper.innerHTML += `<button value=${page} class="page btn btn-sm btn-info">${page}</button>`;
    }

    if (posts["current_page"] != 1) {
        wrapper.innerHTML = `<button value=${1} class="page btn btn-sm btn-info">&#171; First</button>` + wrapper.innerHTML;
    }

    if (posts["current_page"] != posts["total_pages"]) {
        wrapper.innerHTML += `<button value=${posts["total_pages"]} class="page btn btn-sm btn-info">Last &#187;</button>`;
    }

    $('.page').on('click', function() {

        posts["current_page"] = Number($(this).val())

        console.log(posts);
        postsPerPage(posts);
    })

}

function postsPerPage(posts) {
    let url =  window.location.origin + "/api/post-list/?page" + posts["current_page"];
    results = fetching(posts);
    console.log(results);

    let el=document.getElementById('posts-view').getElementsByClassName('post-dv');
    while(el.length){
        el[0].parentNode.removeChild(el[0]);
    }
    
    results["data"].forEach(result => update_posts(result, "all"));
    pageButtons(posts);
}
