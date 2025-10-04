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

    // window.open 오버라이드 - 조건부 처리
    const originalWindowOpen = window.open;
    window.open = function(url, name, specs, replace) {
      console.log('window.open 감지됨:', url, '현재 페이지:', window.location.href);
      
      // register_form.php에서만 원래 window.open 사용
      const internalPages = [
        'register_form.php'
      ];
      
      const currentUrl = window.location.href;
      const shouldUseInternal = internalPages.some(page => 
        currentUrl.includes(page) || (url && url.includes(page))
      );
      
      if (shouldUseInternal) {
        console.log('register_form.php에서 window.open 호출 - 원래 기능 유지');
        return originalWindowOpen.call(this, url, name, specs, replace);
      }
      
      // 일반 페이지에서는 외부 브라우저로 리다이렉트
      if (url) {
        console.log('일반 페이지에서 window.open 호출 - 외부 브라우저로 리다이렉트');
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'openExternal',
          url: url
        }));
      }
      
      // 내부에서는 새창을 열지 않음
      return null;
    };

    // 이미지 지연 로딩 및 반응형 최적화
    document.querySelectorAll('img').forEach(img => {
      img.loading = 'lazy';
      // 이미지가 컨테이너를 넘지 않도록 설정
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
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
