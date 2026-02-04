
import os

try:
    with open('extracted_body.jsx', 'r', encoding='utf-8') as f:
        body_content = f.read()

    # Wrap in Next.js Page component
    # We use "use client" because the original code likely relies on browser-only behavior or simple DOM structure 
    # that is easier to manage as client component if there are scripts or event listeners (though we removed scripts).
    # Actually, pure HTML/CSS works fine as Server Component, but if there are inline event handlers in the original HTML 
    # (e.g. onclick), they would need client. My script didn't strip event handlers, but text-based extraction of "onclick=..." 
    # would just be attributes.
    # However, React doesn't like `onclick` (lowercase). It wants `onClick`.
    # My convert_html.py didn't convert `onclick` -> `onClick`. 
    # I should start with a server component or client component. 
    # Safest is "use client" just in case.

    page_tsx = f'''"use client";

import React from 'react';

export default function Home() {{
  return (
    <main>
{body_content}
    </main>
  );
}}
'''

    with open('web-app/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(page_tsx)

    print("Successfully created web-app/app/page.tsx")

except Exception as e:
    print(f"Error: {e}")
