const { search, store, bookmarksToList, localSearch,token } = require('./lib.js')

window.exports = {
    "raindrop": {
       mode: "list",
       args: {
          // 进入插件应用时调用（可选）
          enter: (action, callbackSetList) => {
            const t = token.get()
            if(!t) {
                callbackSetList([
                    {
                        "title": "please set raindrop token",
                        "action": "need-token"
                    }
                ])
                return
            }
            
             let data = store.load()
             callbackSetList(bookmarksToList(data))
          },
          // 子输入框内容变化时被调用 可选 (未设置则无搜索)
          search: (action, searchWord, callbackSetList) => {
            const t = token.get()
            if(!t) {
                return
            }

            let tips = (msg) => {
                callbackSetList([
                    {
                        "title": msg
                    }
                ])
            }

            
            console.log("start search...")
            let data = localSearch(searchWord);
            console.log(data)
            data.length ? callbackSetList(bookmarksToList(data)) : tips("loading....")
            search(searchWord).then((data) => {
                if(data.result == false) {
                    tips("error: " + data.errorMessage)
                    return
                }
                
                callbackSetList(bookmarksToList(data.items))
            }).catch(error => tips("error: " + error))
          },
          // 用户选择列表中某个条目时被调用
          select: (action, itemData, callbackSetList) => {
            if(itemData.action) {
                utools.redirect('raindrop settings', '')
                return 
            }
             window.utools.hideMainWindow()
             const url = itemData.url
             require('electron').shell.openExternal(url)
             store.push(itemData.rawData)
             window.utools.outPlugin()
          },
          // 子输入框为空时的占位符，默认为字符串"搜索"
          placeholder: "搜索"
       } 
    },
    "raindrop-settings": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                callbackSetList([
                    {
                        "title": "set raindrop token",
                        "action": "set-token"
                    },
                    {
                        "title": "clear raindrop token",
                        "action": "clear-token"
                    },
                    {
                        "title": "clear bookmarks cache",
                        "action": "clear-cache"
                    },
                ])
             },
             search: (action, searchWord, callbackSetList) => {
                callbackSetList([
                    {
                        "title": "set raindrop token",
                        "token": searchWord,
                        "action": "set-token"
                    },
                    {
                        "title": "clear raindrop token",
                        "action": "clear-token"
                    },
                    {
                        "title": "clear bookmarks cache",
                        "action": "clear-cache"
                    },
                ])
             },
             select: (action, itemData, callbackSetList) => {
                console.log(itemData)
                if(itemData.action == "clear-token") {
                    token.clear()
                    store.clear()
                    utools.showNotification("clear token success")
                    window.utools.outPlugin()
                    return
                }

                if(itemData.action == "clear-cache") {
                    store.clear()
                    utools.showNotification("clear cache success")
                    window.utools.outPlugin()
                    return
                }

                if(!itemData.token) {
                    utools.showNotification("please input token")
                    return
                }

                token.set(itemData.token)
                utools.showNotification("set token success")
                window.utools.outPlugin()
             },
             placeholder: "input raindrop token"
        }
    }
 }