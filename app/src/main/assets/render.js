export function renderHtml(pattern, words) {
  let searchResultsContent = "";
  var typeMap = {
    'creative': '创意生成',
    'problem': '问题解决',
    'education': '学习与教育',
    'improvement': '自我提升'
  }
  // 如果是列表
  if (words.length > 0) {
    let wordList = "";
    //for (const word of words) {
    //  wordList += `<li>${word}</li>`;
    //}
    searchResultsContent = `
        <ul id="search-result" name="search-results"> 
          ${words.map((item) => {
      return `<div  data-id="result-list-${item[0]}" id="result-list"> <span class="prompt-type">` + (typeMap[item[1]] || item[1]) + '</span>' + '<span class="prompt-content">' + item[2] + `<button class="copy">复制</button> <button class="delete-btn" data-item-id="${item[0]}">删除</button> </div>`
    }).join('')}
        </ul>
      `;
  }

  // 返回html
  return `<html>
    <head>
        <meta name="version" content="1.0" />
        <style>
          .delete-btn {
            display: none;
          }
          .prompt-type {
            min-width: 100px;
          }
          .prompt-content {
            width: 100%;
            margin-left: 20px;
            position: relative;
          }
          .prompt-content:hover {
            border: 1px solid gray;
          }
          .copy {
            position: absolute;
            display: none;
            top: -20;
            left: -10;
          }
          .prompt-content:hover button.copy {
            display: inline-block;
          }
          #result, #result-list {
              display: flex;
              justify-content: space-around;
          }
          #result {
            background-color: peachpuff;
          }
          #result-list {
            margin-top: 10px;
            background-color: beige;
          }
          #search-result {
            padding-inline-start: 0;
          }
          #perform-delete {
            display: none;
          }
          #user-container,perform-insert {
            display: flex;
            align-items: flex-end;
            flex-direction: row;
            justify-content: flex-end;
          }
          #form-header {
            display: flex;
            justify-content: space-between;
          }
          #result-list {
            display: flex;
            justify-content: flex-start;
          }
          #result {
            font-weight: bold;
            display: flex;
            justify-content: flex-start;
            column-gap: 90px;
          }
        </style>
        <script src="https://cdn.bootcdn.net/ajax/libs/rxjs/7.8.1/rxjs.umd.min.js"></script> 
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        
    </head>
    <body>
        <div id="user-container">
          <label for="search-text">用户名</label>
          <input id="uid" name="uid" type="text" value="" />
          <label for="search-text">密码</label>
          <input id="auth" name="auth" type="text" value="" />
          <input type="button" id="login-button" value="登陆"></input>
          <input type="button" id="register-button" value="注册"></input>
        </div>
        
        <div id='form-header'>
          <form id="perform-search" name="perform-search">
              <label for="search-text">Search text:</label>
              <input id="search-text" name="search-text" type="text" value="${pattern}" />
              <input type="button" id="submit-button" value="查询"></input>
          </form>
  
          <form id="perform-insert">
              <label for="search-text">类型</label>
              <select id="wechat-id" name="wechat-id" type="text" value="" >
                <option value="creative">创意生成</option>
                <option value="problem">问题解决</option>
                <option value="education">学习与教育</option>
                <option value="improvement">自我提升</option>
              </select>
              <label for="search-text">提示词</label>
              <textarea id="book-name" name="book-name" type="text" value="">
              </textarea>
              <input type="button" id="insert-button" value="增加"></input>
          </form>
        </div>
        <form id="perform-delete">
            <label for="id-text">id</label>
            <input id="id" name="id" type="text" value="" />
            <input type="button" id="delete-button" value="删除"></input>
        </form>

        <div id='result'>
          <div>类型</div>
          <div>提示词</div>
        </div>

        <div id='result-list-container'>
          ${searchResultsContent}
        </div>
  
        <script>
        var typeMap = {
          'creative': '创意生成',
          'problem': '问题解决',
          'education': '学习与教育',
          'improvement': '自我提升'
          }
          // 查询
          document.getElementById('submit-button').addEventListener('click', (e) => {
            console.log(e)
            let inputElement = document.getElementById('search-text')
            let searchText = inputElement.value
            let resultElement = document.getElementById('result-list-container')
            console.log(searchText)
            fetch('/api/reasons?search-text=' + encodeURIComponent(searchText), {
             headers: {
              "Content-Type": "application/json",
              },
            }).then(function(response) {
              return response.json();
            }).then(function(myJson) {
              console.log(myJson.result);
              let generateHtml = function(rows) {
                return rows.map((item) => {
                  // return '<div id="result-list"><span>' + item[1]+ '</span>' + '<span>' + item[2] + '</span></div>'
                  return '<div id="result-list"><span class="prompt-type">' + (typeMap[item[1]] || item[1]) + '</span>' + '<span class="prompt-content">' + item[2] + '<button class="copy">复制</button></span></div>'
        
                }).join('')
              }
              // JSON.stringify(myJson.result.rows)
              resultElement.innerHTML = generateHtml(myJson.result.rows)
              var copyButton = document.getElementsByClassName('copy');
              Array.from(copyButton).forEach((button) => {
                button.onclick = function(e) {
                var content = e.target.parentElement.firstChild.textContent || e.target.parentElement.innerText;
                copyToClipboard(content)
                
                }
                })
            });
          })
        </script>

        
        <script>
          // 插入
          document.getElementById('insert-button').addEventListener('click', (e) => {
            console.log(e)
            let wechatElement = document.getElementById('wechat-id')
            let bookNameElement = document.getElementById('book-name')
            let wechat = wechatElement.value
            let bookName = bookNameElement.value
            let data = {
              bookName,
              wechat
            }
            let auth = localStorage.getItem('auth')
            let uid = localStorage.getItem('uid')
            fetch('/api/reasons', {
              body: JSON.stringify(data),
              method: "POST", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "x-auth": auth,
                "x-uid": uid,
                "Content-Type": "application/json",
              },
            }).then(function(response) {
              return response.json();
            }).then(function(myJson) {
              location.reload();
              console.log(myJson.result);
            });
          })
        </script>

        <script>
          // 删除
          document.getElementById('delete-button').addEventListener('click', (e) => {
            let idElement = document.getElementById('id')
            let id = idElement.value
            let auth = localStorage.getItem('auth')
            let uid = localStorage.getItem('uid')
            fetch('/api/reasons/' + id , {
              method: "DELETE", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "x-auth": auth,
                "x-uid": uid,
                "Content-Type": "application/json",
              },
            }).then(function(response) {
              return response.json();
            }).then(function(myJson) {
            console.log(myJson);
      // 成功删除后从DOM中移除该元素
      const id = myJson.result.query.text.match(/\\d{13}/)[0]; // Extract the ID from the response
      const itemElement = document.querySelector('[data-id="result-list-' + id + '"]');
      if (itemElement) {
        itemElement.remove();
      }
      idElement.value = ''; // Clear the input
      console.log('Item deleted successfully');
 
              console.log(myJson.result);
            });
          })
        </script>

        <script>
          // 登陆 
          document.getElementById('login-button').addEventListener('click', (e) => {
            let uidElement = document.getElementById('uid')
            let authElement = document.getElementById('auth')
            let uid = uidElement.value
            let auth = authElement.value
            fetch('/api/login', {
              method: "POST", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "x-uid": uid,
                "x-auth": auth,
                "Content-Type": "application/json",
              },
            }).then(function(response) {
              return response.json();
            }).then(function(myJson) {
             if (myJson.result) { // Check if login was successful
      localStorage.setItem('auth', myJson.result.auth)
      localStorage.setItem('uid', myJson.result.uid)
      
      console.log(myJson.result);
      // Refresh page after successful login
      location.reload(); // This will refresh the page
    } else {
      // Handle login failure
      alert('Login failed');
    }

    // Add logout functionality
document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('uid');
  location.reload();
});
              // localStorage.setItem('auth', myJson.result.auth)
              // localStorage.setItem('uid', myJson.result.uid)
              // console.log(myJson.result);
            });
          })
        </script>

        <script>
          // 注册 
          document.getElementById('register-button').addEventListener('click', (e) => {
            let uidElement = document.getElementById('uid')
            let authElement = document.getElementById('auth')
            let uid = uidElement.value
            let auth = authElement.value
            fetch('/api/register', {
              body: JSON.stringify( {
                uid,
                auth
              }),
              method: "POST", // *GET, POST, PUT, DELETE, etc.
              headers: {
                "x-uid": uid,
                "x-auth": auth,
                "Content-Type": "application/json",
              },
            }).then(function(response) {
              return response.json();
            }).then(function(myJson) {
              localStorage.setItem('auth', myJson.result.auth)
              localStorage.setItem('uid', myJson.result.uid)
              console.log(myJson.result);
            });
          })
        </script>
        <script>
          if(localStorage.uid && localStorage.auth) { document.querySelector('#user-container').innerHTML = localStorage.uid}
        </script>
        <script>
        function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    // 使用 Clipboard API
    navigator.clipboard.writeText(text).then(function() {
      console.log('内容已成功复制到剪贴板');
    }).catch(function(err) {
      console.error('复制内容到剪贴板失败: ', err);
    });
  } else {
    // 回退方案
    let textArea = document.createElement("textarea");
    textArea.value = text;
    // 隐藏textarea元素
    textArea.style.position = "fixed";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      let successful = document.execCommand('copy');
      let msg = successful ? '成功复制到剪贴板' : '复制到剪贴板失败';
      console.log(msg);
    } catch (err) {
      console.error('复制内容到剪贴板失败: ', err);
    }
    document.body.removeChild(textArea);
  }
}

// 使用函数复制文本
// let contentToCopy = "这是需要复制的内容";
// copyToClipboard(contentToCopy);

var copyButton = document.getElementsByClassName('copy');
Array.from(copyButton).forEach((button) => {
  button.onclick = function(e) {
  var content = e.target.parentElement.firstChild.textContent || e.target.parentElement.innerText;
  copyToClipboard(content)
  
  }
})

        </script>

    
        <script type="text/javascript">
          document.addEventListener('DOMContentLoaded', function () {
          // 获取所有的输入框元素
          var inputs = document.querySelectorAll('#search-text');
          inputs.forEach(function(input) {
              // 给每个输入框添加keydown事件监听器
              input.addEventListener('keydown', function(event) {
                  // 检查是否按下了回车键(event.key === 'Enter' 或者 event.keyCode === 13)
                  if (event.key === 'Enter') {
                      // 阻止默认行为（即提交表单）
                      event.preventDefault();
                      // 这里可以添加其他你想要执行的操作
                  }
              });
          });
        });
      </script>

      <script>
        // 获取Observable和相关操作符
        const { Observable, of } = rxjs;
        const { map, filter } = rxjs.operators;
        
        // 创建一个简单的Observable序列
        const source = of(1, 2, 3, 4, 5);
        
        // 使用pipe方法应用操作符
        const example = source.pipe(
          filter(num => num % 2 === 0), // 只选择偶数
          map(num => num * 2)           // 将每个数值乘以2
        );
        
        // 订阅observable来执行并接收数据
        example.subscribe(val => console.log(val));
      </script>
   
        

    </body>
  </html>
  `;
}
