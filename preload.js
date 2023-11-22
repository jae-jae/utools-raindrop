const { search, store, bookmarksToList, localSearch } = require('./lib.js')

window.exports = {
    "raindrop": {
       mode: "list",
       args: {
          // 进入插件应用时调用（可选）
          enter: (action, callbackSetList) => {
             let data = store.load()
             callbackSetList(bookmarksToList(data))
          },
          // 子输入框内容变化时被调用 可选 (未设置则无搜索)
          search: (action, searchWord, callbackSetList) => {
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
             window.utools.hideMainWindow()
             const url = itemData.url
             require('electron').shell.openExternal(url)
             store.push(itemData.rawData)
             window.utools.outPlugin()
          },
          // 子输入框为空时的占位符，默认为字符串"搜索"
          placeholder: "搜索"
       } 
    }
 }