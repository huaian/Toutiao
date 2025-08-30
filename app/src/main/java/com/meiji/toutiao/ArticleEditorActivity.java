package com.meiji.toutiao;

// 需要导入WebView相关类
import android.app.Activity;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
// 添加AppCompatActivity导入
// 也需要导入Bundle类
import android.os.Bundle;


// ArticleEditorActivity.java
public class ArticleEditorActivity extends Activity {
    private WebView webView;
    private String articleContent = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_article_editor);

        // 确保布局中的webview_editor是WebView类型
        webView = (WebView) findViewById(R.id.webview_editor);
        setupWebView();
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // 加载包含 CodeMirror 的本地 HTML 文件
        webView.loadUrl("file:///android_asset/editor.html");

        webView.addJavascriptInterface(new EditorInterface(), "Android");
    }

    // JavaScript 接口类
    public class EditorInterface {
        @JavascriptInterface
        public void onContentChange(String content) {
            articleContent = content;
        }

        @JavascriptInterface
        public void saveArticle() {
            // 保存文章逻辑
            saveArticleToServer(articleContent);
        }
    }

    private void saveArticleToServer(String content) {
        // 实现保存到服务器的逻辑
    }
}
