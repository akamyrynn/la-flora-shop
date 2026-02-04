
import html.parser
import re
import os
import json

# Helper to camelCase CSS properties
def camel_case(s):
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), s)

class ReactJSXConverter(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.output = []
        self.css_output = []
        self.in_style = False
        self.in_script = False
        self.depth = 0
        self.capture_depth = -1 # Level to start capturing (body content)

    def handle_starttag(self, tag, attrs):
        if tag == 'style':
            self.in_style = True
            return
        if tag == 'script':
            self.in_script = True
            # We skip scripts usually, but if inside body maybe keep? User said just matching design.
            # Commenting out scripts to avoid errors is safer.
            self.output.append('{/* <script ... */}') 
            return

        if tag == 'body':
            self.capture_depth = self.depth
        
        if self.capture_depth != -1 and self.depth > self.capture_depth:
            # We are inside body. Output tag.
            attr_str = ""
            for name, value in attrs:
                if name == 'class':
                    name = 'className'
                elif name == 'for':
                    name = 'htmlFor'
                elif name == 'style' and value:
                    # Convert style string to object
                    style_dict = {}
                    for item in value.split(';'):
                        if ':' in item:
                            k, v = item.split(':', 1)
                            k = camel_case(k.strip())
                            v = v.strip()
                            style_dict[k] = v
                    style_props = ", ".join([f"'{k}': {json.dumps(v)}" for k,v in style_dict.items() if k and v])
                    value = "{{" + style_props + "}}"
                    attr_str += f" {name}={value}"
                    continue 
                
                # Default handling
                attr_str += f' {name}="{value}"'

            # Check for void tags
            if tag in ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']:
                self.output.append(f"<{tag}{attr_str} />")
            else:
                self.output.append(f"<{tag}{attr_str}>")

        self.depth += 1

    def handle_endtag(self, tag):
        self.depth -= 1
        if tag == 'style':
            self.in_style = False
            return
        if tag == 'script':
            self.in_script = False
            return
        
        if tag == 'body':
            self.capture_depth = -1
        
        if self.capture_depth != -1 and self.depth > self.capture_depth:
            # void tags
            if tag in ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']:
                pass # Already output start tag, maybe self close?
                # Actually standard html parser gives separate events. 
                # If we output <img ... > in starttag, we don't output </img> in endtag for void elements in JSX?
                # Wait, JSX requires <img />. Starttag doesn't know if it's self closing in HTML input.
                # Standard HTML void tags don't have end tags.
                pass
            else:
                self.output.append(f"</{tag}>")

    def handle_data(self, data):
        if self.in_style:
            self.css_output.append(data)
        elif self.in_script:
            pass
        elif self.capture_depth != -1 and self.depth > self.capture_depth:
            # Escape { and } for JSX
            data = data.replace('{', '&#123;').replace('}', '&#125;')
            self.output.append(data)

    def handle_startendtag(self, tag, attrs):
        # Self closing tag
        if self.capture_depth != -1 and self.depth > self.capture_depth:
            attr_str = ""
            for name, value in attrs:
                if name == 'class':
                    name = 'className'
                elif name == 'for':
                    name = 'htmlFor'
                elif name == 'style' and value:
                    style_dict = {}
                    for item in value.split(';'):
                        if ':' in item:
                            k, v = item.split(':', 1)
                            k = camel_case(k.strip())
                            v = v.strip()
                            style_dict[k] = v
                    style_props = ", ".join([f"'{k}': {json.dumps(v)}" for k,v in style_dict.items() if k and v])
                    value = "{{" + style_props + "}}"
                    attr_str += f" {name}={value}"
                    continue

                attr_str += f' {name}="{value}"'
            
            self.output.append(f"<{tag}{attr_str} />")

try:
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    parser = ReactJSXConverter()
    parser.feed(content)

    with open('extracted_styles.css', 'w', encoding='utf-8') as f:
        f.write("".join(parser.css_output))
    
    with open('extracted_body.jsx', 'w', encoding='utf-8') as f:
        f.write("".join(parser.output))

    print("Extraction complete.")

except Exception as e:
    print(f"Error: {e}")

