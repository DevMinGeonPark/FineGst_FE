/**
 * 웹뷰 최적화를 위한 JavaScript 코드
 * 뷰포트 설정, 창 닫기 핸들러, 이미지 지연 로딩, 불필요한 리소스 차단 등을 포함
 */
export const getWebViewOptimizedJavaScript = (): string => {
  return `
    // 뷰포트 설정
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'); 
    meta.setAttribute('name', 'viewport'); 
    document.head.appendChild(meta);

    // 창 닫기 핸들러
    window.close = function() {
      window.ReactNativeWebView.postMessage("close");
    }

    // 이미지 지연 로딩
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });

    // 불필요한 리소스 차단
    const blockedResources = ['analytics.js', 'tracker.js', 'google-analytics.com'];
    blockedResources.forEach(res => {
      const scripts = document.querySelectorAll('script[src*="' + res + '"]');
      scripts.forEach(script => script.remove());
    });
    true;
  `;
};

/**
 * 웹뷰 성능 최적화 설정
 */
export const webViewOptimizationConfig = {
  // 차단할 리소스 목록
  blockedResources: ["analytics.js", "tracker.js", "google-analytics.com", "facebook.net", "googletagmanager.com"],

  // 지연 로딩할 요소들
  lazyLoadSelectors: ["img", "iframe", "video"],

  // 뷰포트 설정
  viewportConfig: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: 0,
  },
};

/**
 * 커스텀 최적화 JavaScript 생성
 */
export const createCustomOptimizedJavaScript = (config?: {
  blockedResources?: string[];
  lazyLoadSelectors?: string[];
  viewportConfig?: typeof webViewOptimizationConfig.viewportConfig;
}): string => {
  const finalConfig = {
    ...webViewOptimizationConfig,
    ...config,
  };

  return `
    // 뷰포트 설정
    const meta = document.createElement('meta'); 
    meta.setAttribute('content', 'width=${finalConfig.viewportConfig.width}, initial-scale=${finalConfig.viewportConfig.initialScale}, maximum-scale=${
    finalConfig.viewportConfig.maximumScale
  }, user-scalable=${finalConfig.viewportConfig.userScalable}'); 
    meta.setAttribute('name', 'viewport'); 
    document.head.appendChild(meta);

    // 창 닫기 핸들러
    window.close = function() {
      window.ReactNativeWebView.postMessage("close");
    }

    // 이미지 지연 로딩
    ${finalConfig.lazyLoadSelectors
      .map(
        (selector) => `
    document.querySelectorAll('${selector}').forEach(element => {
      element.loading = 'lazy';
    });`
      )
      .join("\n    ")}

    // 불필요한 리소스 차단
    const blockedResources = ${JSON.stringify(finalConfig.blockedResources)};
    blockedResources.forEach(res => {
      const scripts = document.querySelectorAll('script[src*="' + res + '"]');
      scripts.forEach(script => script.remove());
    });
    true;
  `;
};
