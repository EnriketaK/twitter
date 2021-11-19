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
        //show_posts('all');
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

    //let network = document.getElementById('network'); //skam nevoj per ket because of if
      //  if (network) {
        //    network.addEventListener('click', () => {
          //      history.pushState(" ", "", url + "/home");
            //    show_posts('all');
     //       });
       // }
       var tableData = [
        {
            "id": 77,
            "poster": "enri",
            "content": "38",
            "date_posted": "08/15/2020 15:50:44",
            "author": 2
        },
        {
            "id": 31,
            "poster": "enri",
            "content": "2",
            "date_posted": "08/14/2020 08:57:28",
            "author": 2
        },
        {
            "id": 30,
            "poster": "enri",
            "content": "1",
            "date_posted": "08/14/2020 08:57:25",
            "author": 2
        },
        {
            "id": 77,
            "poster": "enri",
            "content": "38",
            "date_posted": "08/15/2020 15:50:44",
            "author": 2
        },
        {
            "id": 31,
            "poster": "enri",
            "content": "2",
            "date_posted": "08/14/2020 08:57:28",
            "author": 2
        },
        {
            "id": 30,
            "poster": "enri",
            "content": "1",
            "date_posted": "08/14/2020 08:57:25",
            "author": 2
        },
        {
            "id": 79,
            "poster": "enk",
            "content": "40",
            "date_posted": "08/15/2020 15:50:58",
            "author": 4
        },
        {
            "id": 39,
            "poster": "enk",
            "content": "10",
            "date_posted": "08/14/2020 08:59:16",
            "author": 4
        },
        {
            "id": 38,
            "poster": "enk",
            "content": "9",
            "date_posted": "08/14/2020 08:59:14",
            "author": 4
        }
    ]
    
    var state = {
        'querySet': tableData,
    
        'page': 1,
        'posts': 2,
        'window': 5,
    }
    let r = pagination(state.querySet, state.page, state.posts);
    pageButtons(r.pages, state);
    postsPerPage(state);

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
        url = domain + "/api/post-list/all";
    }
    else {
        url = domain + "/api/post-list/" + sort;
    }

    fetch(url)
    .then(response => response.json())
    .then(posts => {
        
      posts.forEach(post => update_posts(post, sort));
  
    }); 
}


function update_posts(post, sort) {

    const element = document.createElement('div');
    element.setAttribute("class", "post-dv");

    var path = window.location.pathname.split('/')[1];
    
    if (! "profile" == path) {
        console.log(path);
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

    var pages = Math.round(querySet.length / posts);

    return {
        'querySet': trimmedData,
        'pages': pages,
    }
}


function pageButtons(pages, state) {
    var wrapper = document.getElementById('pagination-wrapper');

    wrapper.innerHTML = ``;
	console.log('Pages:', pages);

    var maxLeft = (state.page - Math.floor(state.window / 2));
    var maxRight = (state.page + Math.floor(state.window / 2));

    if (maxLeft < 1) {
        maxLeft = 1;
        maxRight = state.window;
    }

    if (maxRight > pages) {
        maxLeft = pages - (state.window - 1);
        
        if (maxLeft < 1){
        	maxLeft = 1;
        }
        maxRight = pages;
        console.log('pages:', maxRight);
    }
    
    for (var page = maxLeft; page <= maxRight; page++) {
        wrapper.innerHTML += `<button value=${page} class="page btn btn-sm btn-info">${page}</button>`;
    }

    if (state.page != 1) {
        wrapper.innerHTML = `<button value=${1} class="page btn btn-sm btn-info">&#171; First</button>` + wrapper.innerHTML;
    }

    if (state.page != pages) {
        wrapper.innerHTML += `<button value=${pages} class="page btn btn-sm btn-info">Last &#187;</button>`;
    }

    $('.page').on('click', function() {

        state.page = Number($(this).val())

        console.log(state.page);
        postsPerPage(state);
    })

}

function postsPerPage(state) {
    var data = pagination(state.querySet, state.page, state.posts);
    posts = data.querySet;
    let el=document.getElementById('posts-view').getElementsByClassName('post-dv');
    while(el.length){
        el[0].parentNode.removeChild(el[0]);
    }
    posts.forEach(post => update_posts(post, "all"));
    pageButtons(data.pages, state);
}

function buildTable() {
    var table = $('#table-body')

    var data = pagination(state.querySet, state.page, state.rows)
    var myList = data.querySet

    for (var i = 1 in myList) {
        //Keep in mind we are using "Template Litterals to create rows"
        var row = `<tr>
                  <td>${myList[i].rank}</td>
                  <td>${myList[i].first_name}</td>
                  <td>${myList[i].last_name}</td>
                  `
        table.append(row)
    }

    pageButtons(data.pages)
}
