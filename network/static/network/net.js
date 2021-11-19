document.addEventListener('DOMContentLoaded', function () {

    window.addEventListener("popstate", function (event){
        //alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
        displayElements("block");
        console.log(location.pathname);

        if (location.pathname === "/following") {
            displayElements("none");
            show_posts('following');
        }

        if (location.pathname === "/all-posts") {
            displayElements("none");
            let posts = document.querySelector('.posts-view');
            console.log(posts);
            if (posts) {
                posts.style.display = "block";
            }
            displayBigContainer("block");
            show_posts('all');
        }

        if (location.pathname === "/login" || location.pathname === "/register") {
            displayElements("none");
            let logging = document.getElementsByClassName('logging');
            if (logging) {
                var i;
                for (i = 0; i < logging.length; i++) {
                    logging[i].style.display = "block";
                }
            }

            displayBigContainer("none");
            let posts = document.querySelector('.posts-view');
            console.log(posts);
            if (posts) {
                posts.style.display = "none";
            }
        }
    });

    const path = window.location.pathname.split('/')[1];

    if ("profile" != path && path != "login" && path != "register") { //check if profile in path
        var el = document.getElementById('submit-btn'); //skam nevoj per ket because of if
        if (el) {
            el.addEventListener('click', check_post);
        }
        show_posts('all');
    }
    else if (path === "profile") { //else what?
        const username = window.location.pathname.split('/')[2];
        show_posts(username);

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

    else if(path === "following") {
        console.log("yo");
    }
    const url = window.location.origin.split('/')[1];

    followingClicker(url);
    allPostsClicker(url);

});

function followingClicker(url) {
    let following = document.getElementById('followed-posts'); //skam nevoj per ket because of if
    if (following) {
        following.addEventListener("click", function (e) {
            displayElements("none");
            show_posts('following');
            history.pushState(null, null, url + "/following");
            e.preventDefault();
        }, false);
    }
}

function allPostsClicker(url) {
    document.querySelector('#all-posts').addEventListener('click', () => {
        history.pushState(null, null, url + "/all-posts");
        displayElements("none");
        show_posts('all-posts');
    });
}


function displayElements(value) {

    let writePost = document.getElementById('new-post-view');
    if (writePost) {
        writePost.style.display = value;
    }

    let profile = document.getElementById('user-profile');
    if (profile) {
        profile.style.display = value;
    }

    let logging = document.getElementsByClassName('logging');
    if (logging) {
        var i;
        for (i = 0; i < logging.length; i++) {
            logging[i].style.display = value;
        }
    }
}


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
                username = document.getElementById('username').getAttribute('value');
                update_posts(result, 'update');
                // Print result
                console.log("RESULT:", result);
            });

        content.value = "";
    }
}

function fetchUpdate(username) { //unused
    fetch(`api/last-post/${username}`)
            .then(response => response.json())
            .then(post => {
                console.log(post);
                update_posts(post, 'update');
            });
}

function show_posts(sort) {

    if(sort === "all-posts" || sort === "following") { //or check the link for profile or empty
        if (sort === "all-posts") {
            sort = "all";
        }
    }
    let url = "";
    const domain = window.location.origin;

    if (sort === "all")  {
        url = domain + "/api/post-list/";
    }
    else if (sort === "following") {
        url =  domain + "/api/post-list-following/"; //bad results, backend prob?
    }
    else {
        url = domain + "/api/post-list/" + sort;    
    }
    console.log(sort);
    
    fetch_posts(url, sort);
}

function remove_el() {
    let elements = document.getElementsByClassName('post-dv'); 
    //let elements = document.getElementById('posts-view').getElementsByClassName('post-dv'); 

    if (elements) {
        while(elements.length){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }
}

function fetch_posts(url, sort) {
    console.log(url);
    fetch(url)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
        remove_el();
        posts["data"].forEach(post => update_posts(post, sort));
        
        posts["total_pages"] =  Math.ceil(posts["total_pages"]);
        posts["window"] = 5;
        console.log(posts["data"]);
        
        pageButtons(posts, sort);
    }); 
}

function fetching(posts) {
    let url =  window.location.origin + "/api/post-list/?page" + posts["current_page"];

    fetch(url)
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
    
    if ("profile" != path) {
        element.innerHTML += "Author: " + '<a href="profile/'+post.poster+'">'+post.poster+'</a>' + "<br>"; //link("profile/" + post.author) +
    }
    element.innerHTML += "Content: " + post.content + "<br>";
    element.innerHTML += "Date: " + post.date_posted + "<br>";

    let para = document.createElement("p");
    para.innerHTML = "Likes: "  + post.likes;
    para.setAttribute("id", post.id);
    element.appendChild(para);
    console.log(post.current_user === "");

    if (post.current_user != ""){
        createLikeBtn(element, post);
    }

    if (post.poster === post.current_user) {
        let btn = document.createElement("BUTTON");
        //element += btn;
        element.appendChild(btn);
        btn.innerHTML = "Edit";
        btn.setAttribute("class", "btn btn-sm btn-dark");
        //element.innerHTML += `<button class="edit btn btn-sm btn-dark">Edit</button>` + "<br>";

        if(btn){
            btn.addEventListener('click', () => {
                edit_post(post, element, btn);
            });
        }
    }

    element.style.border = "groove";
    element.style.margin = "10px";
    element.style.color = "black";


    if (sort === 'update') {
        var item = document.querySelector('#posts-view');
        item.insertBefore(element, item.firstChild);
    }
    else {
        let postsView = document.getElementById('posts-view'); //skam nevoj per ket because of if
        if (postsView) {
            postsView.append(element);
        }
        else {
            document.querySelector('.posts-view').append(element);
        }
    }

}

function createLikeBtn(element, post) {
    let btn = document.createElement("BUTTON");
    btn.setAttribute("class", "btn btn-sm btn-light");
    element.appendChild(btn);

    const url = window.location.origin + "/api/like-state/" + post.current_user + "/" + post.id + "/";

    fetch(url)
    .then(response => response.json())
    .then(l => {
        let liking = l["liking"];

        if (liking === true) {
            btn.innerHTML = "Unlike";
        }
        else {
            btn.innerHTML = "Like";
        }

        console.log(liking);

        if(btn){
            btn.addEventListener('click', () => {
                liking = !(liking);
                likeState(post, url, liking, btn);
            });
        }
    });


}

function likeState(post, url, liking, btn) {

    fetch(`/api/like-state/${post.current_user}/${post.id}`)
    .then(response => response.json())
    .then(l => { console.log(l)
    });

    const csrftoken = Cookies.get('csrftoken');
    console.log(liking);

    fetch(url, { //error??????
        method: 'PUT',
        headers: {
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            liker: post.current_user,
            liked: post.id,
            liking: liking
        })
    })
        .then(response => {
            fetch_likes(post);
            likingBtn(url, btn);
        });
}

function likingBtn(url, btn) {

    fetch(url)
    .then(response => response.json())
    .then(post => { 
        console.log(post);

        if (post.liking === true) {
            btn.innerHTML = "Unlike";
        }
        else {
            btn.innerHTML = "Like";
        }
    });

}

function fetch_likes(post) {

    const url = window.location.origin + "/api/post-detail/" + post.id + "/";

    fetch(url)
    .then(response => response.json())
    .then(post => { 
        let p = document.getElementById(post.id);
        p.innerHTML = "Likes: "  + post.likes;
    });

}

function edit_post(post, element, btn) {
    displayBigContainer("none");
    create_edit_view(post);
   
}

function create_edit_view(post){
    let el = document.createElement('div');
    el.setAttribute("id", "edit-view");
    el.innerHTML +='<h5 id="edit-header">Edit post</h5>' + "<br>";

    var txtArea = document.createElement("TEXTAREA");
    txtArea.setAttribute("id", "txt-edit");
    txtArea.value = post.content;

    el.appendChild(txtArea);
    
    el.style.border = "groove";
    el.style.margin = "10px";
    el.style.color = "black";

    let button = document.createElement("BUTTON");
    button.innerHTML = "Save";
    button.setAttribute("class", "btn btn-sm btn-light");
    el.appendChild(button);

    document.querySelector('.body').append(el);

    if(button){
        button.addEventListener('click', () => {
            check_edit(post);
        });
    }
}

function check_edit(post) {

    const content = document.querySelector('#txt-edit');
    console.log(content.value);
    event.preventDefault();

    if (content.value.length === 0) {
        alert("Post is empty.");
    }
    else if (content.value.length > 400) {
        alert("Post is too long.");
    }
    else {
        const csrftoken = Cookies.get('csrftoken');
        console.log(post);
        post.content = content.value; //check if the content changed?
        save_edit(post);
    }

}

function save_edit(post) {
    const csrftoken = Cookies.get('csrftoken');
    const url = window.location.origin + "/api/post-update/" + post.id + "/";

    fetch(url, {
        method: 'PUT',
        headers: {
            "X-CSRFToken": csrftoken,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            author: post.author,
            content: post.content,
            current_user: post.current_user,
            date_posted: post.date_posted,
            id: post.id,
            poster: post.poster
        })
    })
    .then(response => response.json())
    .then(json => {
        let path = window.location.pathname.split('/')[1];
        console.log(path);
        if (path === "profile"){
            let user = window.location.pathname.split('/')[2];
            show_posts(user);
        }
        else {
            show_posts("all");
        }
    });

    displayBigContainer("block");
    displayEditView();
}

function displayEditView(value) {
    let editView = document.getElementById('edit-view'); 
    editView.remove();
}

function displayBigContainer(value) {
    let els = document.getElementsByClassName('big-container'); //skam nevoj per ket because of if
    console.log(els);
    if (els) {
        var i;
        for (i = 0; i < els.length; i++) {
            els[i].style.display = value;
        }
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

        return following;
    });
}

function pageButtons(posts, sort) {
    console.log(posts);
    var wrapper = document.getElementById('pagination-wrapper');

    wrapper.innerHTML = ``;

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
        console.log(sort);

        let u = "";
        if (sort === "all") {
            u =  window.location.origin + "/api/post-list/?page=" + posts["current_page"];
        }
        else if (sort === "following") {
            u =  window.location.origin + "/api/post-list-following/?page=" + posts["current_page"];
            console.log(u);
        }
        else {
            u =  window.location.origin + "/api/post-list/" + sort + "?page=" + posts["current_page"];
        }

        console.log(u);
        fetch_posts(u, sort);
    })

}
