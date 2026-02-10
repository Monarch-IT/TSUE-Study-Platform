from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    # Identify black pixels (below a certain threshold) and make them transparent
    # The logo is blue/white on black.
    threshold = 50 
    
    for item in datas:
        # Check if the pixel is dark (black)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Transparency applied. Saved to {output_path}")

if __name__ == "__main__":
    input_img = r"C:\Users\Mukhammadamin\.gemini\antigravity\brain\9fd9f98a-2cbe-4c1c-84ae-787f01f812e4\uploaded_image_0_1769002021272.png"
    output_img = r"d:\Projects\galactic-voyage\python-galactic-voyage-main\public\tsue-logo.png"
    make_transparent(input_img, output_img)
