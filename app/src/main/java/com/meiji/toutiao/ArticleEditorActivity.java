package com.meiji.toutiao;

// 需要导入WebView相关类
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.JavascriptInterface;
// 添加AppCompatActivity导入
// 也需要导入Bundle类
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;



// ArticleEditorActivity.java
public class ArticleEditorActivity extends Activity {
    private WebView webView;
    private String articleContent = "";
    private SharedPreferences sharedPreferences;
    private static final String PREFS_NAME = "UserPrefs";
    private static final String KEY_UID = "uid";
    private static final String KEY_AUTH = "auth";
    private boolean isEditorReady = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_article_editor);

        sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        webView = (WebView) findViewById(R.id.webview_editor);
        Button btnCancel = findViewById(R.id.btn_cancel);
        Button btnPublish = findViewById(R.id.btn_publish);

        setupWebView();
        setupButtons(btnCancel, btnPublish);
    }

    private void setupButtons(Button btnCancel, Button btnPublish) {
        // 取消按钮 - 返回上一个页面
        btnCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onBackPressed();
            }
        });

        // 发布按钮 - 检查登录状态并发布
        btnPublish.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isUserLoggedIn()) {
                    publishArticle();
                } else {
                    showLoginDialog();
                }
            }
        });
    }

    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // 加载包含 CodeMirror 的本地 HTML 文件
        webView.loadUrl("file:///android_asset/editor.html");

        webView.addJavascriptInterface(new EditorInterface(), "Android");
        // 设置 WebView 加载完成监听器
        webView.setWebViewClient(new android.webkit.WebViewClient() {
            @Override
            public void onPageFinished(android.webkit.WebView view, String url) {
                super.onPageFinished(view, url);
                isEditorReady = true;
                // 页面加载完成后设置焦点
                setEditorFocus();
            }
        });
    }
    private void setEditorFocus() {
        // 通过 JavaScript 设置编辑器焦点
        webView.postDelayed(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript("focusEditor()", null);
            }
        }, 500); // 延迟500ms确保编辑器完全初始化
    }


    private boolean isUserLoggedIn() {
        String uid = sharedPreferences.getString(KEY_UID, null);
        String auth = sharedPreferences.getString(KEY_AUTH, null);
        return uid != null && auth != null && !uid.isEmpty() && !auth.isEmpty();
    }

    private void showLoginDialog() {
        // 创建登录对话框
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("需要登录");
        builder.setMessage("发布文章需要先登录，请先登录。");

        builder.setPositiveButton("去登录", (dialog, which) -> {
            // 这里可以跳转到登录页面，或者在WebView中打开登录页面
            // 根据render.js中的逻辑，可以在WebView中处理登录
            webView.loadUrl("file:///android_asset/render.html"); // 假设你有一个登录页面
        });

        builder.setNegativeButton("取消", (dialog, which) -> dialog.dismiss());

        builder.create().show();
    }

    private void publishArticle() {
        // 调用JavaScript获取文章内容
        webView.evaluateJavascript("editor.getValue()", value -> {
            // 移除引号
            String content = value.replaceAll("^\"|\"$", "");
            articleContent = content;

            // 实际发布逻辑
            performPublish(content);
        });
    }

    private void performPublish(String content) {
        String uid = sharedPreferences.getString(KEY_UID, "");
        String auth = sharedPreferences.getString(KEY_AUTH, "");

        // 这里应该使用网络库（如OkHttp或Retrofit）调用实际的API
        // 模拟发布过程
        new Thread(() -> {
            try {
                // 模拟网络请求
                Thread.sleep(2000);

                // 在主线程显示结果
                runOnUiThread(() -> {
                    Toast.makeText(ArticleEditorActivity.this, "文章发布成功", Toast.LENGTH_SHORT).show();
                    // 发布成功后可以返回主页面
                    finish();
                });
            } catch (InterruptedException e) {
                runOnUiThread(() -> {
                    Toast.makeText(ArticleEditorActivity.this, "发布失败，请重试", Toast.LENGTH_SHORT).show();
                });
            }
        }).start();
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

        @JavascriptInterface
        public void onEditorReady() {
            runOnUiThread(() -> {
                isEditorReady = true;
                setEditorFocus();
            });
        }
    }

    private void saveArticleToServer(String content) {
        // 实现保存到服务器的逻辑
    }


    @Override
    public void onBackPressed() {
        // 点击返回键时也返回上一个页面
        super.onBackPressed();
    }
}
