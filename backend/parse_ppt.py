import zipfile
import xml.etree.ElementTree as ET
import re

pptx_path = r'D:\Downloads\InsiderThreat_Capstone.pptx'
try:
    with zipfile.ZipFile(pptx_path, 'r') as z:
        slide_files = [f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        slide_files.sort(key=lambda x: int(re.search(r'slide(\d+)\.xml', x).group(1)))
        
        print(f"Total Slides: {len(slide_files)}\n")
        for s_file in slide_files:
            slide_num = re.search(r'slide(\d+)\.xml', s_file).group(1)
            content = z.read(s_file)
            tree = ET.fromstring(content)
            
            paragraphs = []
            for p in tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text]
                if texts:
                    paragraphs.append(''.join(texts).strip())
            
            print(f"--- SLIDE {slide_num} ---")
            for p in paragraphs:
                # encode safely for Windows terminal
                safe_p = p.encode('ascii', errors='replace').decode('ascii')
                print(f"  * {safe_p}")
            print()
except Exception as e:
    print(f"Error reading PPTX: {e}")
