const Fuse = require('fuse.js')

let fuse;
utools.onPluginReady(() => {
    console.log(store.load())
    fuse = new Fuse(store.load(), {
        keys: ['title', 'note', 'excerpt', 'link', 'tags']
    })
})

function localSearch(keyword) {
    result = fuse.search(keyword)
    return result.map(item => item.item)
}

let token = {
    set: (token) => {
        localStorage.setItem("token", token)
        utools.db.put({
            _id: "token",
            token: token
        })
    },
    get: () => {
        return utools.db.get("token")?.token
    },
    clear: () => {
        utools.db.remove("token")
    }
}

function search(keyword) {
    var myHeaders = new Headers();
    const t = token.get()
    myHeaders.append("Authorization", "Bearer " + t);
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    console.log(requestOptions);

    return fetch("https://api.raindrop.io/rest/v1/raindrops/0?sort=score&search=" + keyword, requestOptions)
        .then(response => response.json())
}

let store = {
    load: () => {
        let data = utools.dbStorage.getItem("bookmarks")
        if (data) {
            return JSON.parse(data)
        }
        return []
    },
    push: (item) => {
        let data = store.load()
        data = data.filter(i => i._id !== item._id)
        data.unshift(item)
        data = data.slice(0, 100)
        utools.dbStorage.setItem("bookmarks", JSON.stringify(data))
    },
    clear: () => {
        utools.dbStorage.removeItem("bookmarks")
    }
}



function bookmarksToList(bookmarks) {
    let utoolsData = []
    let cacheData = store.load()
    // bookmarks 结果按照 cacheData 的顺序排列
    topData = cacheData.filter(item => bookmarks.find(i => i._id === item._id))
    laterData = bookmarks.filter(item => !topData.find(i => i._id === item._id))
    sortData = topData.concat(laterData)
    sortData.forEach((item) => {
        utoolsData.push({
            title: item.title,
            description: item.note ? item.note : item.excerpt,
            url: item.link,
            icon: item.cover,
            rawData: item
        })
    })
    return utoolsData
}


module.exports = {
    localSearch,
    search,
    store,
    bookmarksToList,
    token
}