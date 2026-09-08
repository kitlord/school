"use client";

import Script from "next/script";
import { useEffect } from "react";

// Whole-site "translate this page" switcher via Google's Website
// Translator widget — machine-translated, but covers every page and any
// admin-entered content (events, staff bios, ...) for free, unlike
// hand-translating school.config.jsonc would. English + Malayalam only
// (see includedLanguages below); add more codes there if needed.
//
// Google's script mutates the DOM directly (wraps translated text in
// extra nodes), which can collide with React's own DOM updates and throw
// "Failed to execute 'removeChild'/'insertBefore' on 'Node'" — a known
// issue wherever this widget is used in a React app. The patch below
// makes those specific mismatches no-ops instead of uncaught exceptions
// that would otherwise crash the page.
function patchNodeMutationsForGoogleTranslate() {
  const proto = Node.prototype as unknown as {
    __translatePatched?: boolean;
    removeChild<T extends Node>(child: T): T;
    insertBefore<T extends Node>(newNode: T, referenceNode: Node | null): T;
  };
  if (proto.__translatePatched) return;
  proto.__translatePatched = true;

  const originalRemoveChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}

export function GoogleTranslate() {
  useEffect(() => {
    patchNodeMutationsForGoogleTranslate();
  }, []);

  return (
    <>
      <div id="google_translate_element" className="notranslate" />
      <Script
        id="google-translate-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: "en",
                  includedLanguages: "en,ml",
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false,
                },
                "google_translate_element"
              );
            }
          `,
        }}
      />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
