/**
 * 웹뷰 최적화를 위한 JavaScript 코드
 * 뷰포트 설정, 창 닫기 핸들러, 이미지 지연 로딩, 불필요한 리소스 차단 등을 포함
 */
export const getWebViewOptimizedJavaScript = (): string => {
  return `
    // 뷰포트 설정
    const viewportContent = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.setAttribute('content', viewportContent);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', viewportContent);
      document.head.appendChild(meta);
    }

    // 텍스트 자동 크기 조정 방지 (특정 Android 기기에서 높이 깨짐 방지)
    if (!document.getElementById('rn-webview-text-size')) {
      const textSizeStyle = document.createElement('style');
      textSizeStyle.id = 'rn-webview-text-size';
      textSizeStyle.textContent = 'html, body { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }';
      document.head.appendChild(textSizeStyle);
    }

    // 실제 뷰포트 높이 동기화 (폴더블/주소창 변화 대응)
    function setAppHeight() {
      var height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-height', height + 'px');
    }
    window.__setAppHeight = setAppHeight;
    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setAppHeight);
    }

    if (!document.getElementById('rn-webview-height-fix')) {
      const heightStyle = document.createElement('style');
      heightStyle.id = 'rn-webview-height-fix';
      heightStyle.textContent = 'html, body { height: 100%; min-height: 100%; } body { min-height: var(--app-height); }';
      document.head.appendChild(heightStyle);
    }

    // 창 닫기 핸들러
    window.close = function() {
      window.ReactNativeWebView.postMessage("close");
    }

    // window.open 오버라이드 - 조건부 처리
    const originalWindowOpen = window.open;
    window.open = function(url, name, specs, replace) {
      // register_form.php에서만 원래 window.open 사용
      const internalPages = ['register_form.php'];
      const currentUrl = window.location.href;
      const shouldUseInternal = internalPages.some(page =>
        currentUrl.includes(page) || (url && url.includes(page))
      );

      if (shouldUseInternal) {
        return originalWindowOpen.call(this, url, name, specs, replace);
      }

      // 일반 페이지에서는 외부 브라우저로 리다이렉트
      if (url) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openExternal',
          url: url
        }));
      }
      return null;
    };

    // 이미지 지연 로딩 설정 (스타일은 원본 유지)
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
    });

    // 불필요한 리소스 차단
    const blockedResources = ['analytics.js', 'tracker.js', 'google-analytics.com'];
    blockedResources.forEach(res => {
      const scripts = document.querySelectorAll('script[src*="' + res + '"]');
      scripts.forEach(script => script.remove());
    });

    var IDInput = document.getElementById('reg_mb_id');
    if (IDInput) {
      IDInput.autocapitalize = "none";
    }
    
    var ipin = document.getElementById('win_ipin_cert');
    if (ipin) {
      ipin.style.display = 'none';
    }

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
