import json
import requests
from bs4 import BeautifulSoup


def scrape_ntnu_by_college():
    url = "https://www.ntnu.edu.tw/static.php?id=colleges"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    print(f"正在從臺師大官網爬取【各學院 + 全學制】科系列表...\n網址: {url}")

    try:
        response = requests.get(url, headers=headers)
        response.encoding = "utf-8"
        response.raise_for_status()
    except Exception as e:
        print(f"❌ 網路請求失敗: {e}")
        return {}

    soup = BeautifulSoup(response.text, "html.parser")

    # 觀察師大官網結構：
    # 每個學院通常是由一個 <h3> 或 class 帶有學院名稱的區塊開頭
    # 底下的系所連結會放在該區塊對應的 div 中
    # 這裡我們使用全面性的大區塊掃描
    result_data = {}

    # 尋找網頁中所有可能是學院名稱的標題（官網中主要用 h3 或 strong 標示學院）
    # 並尋找整個網頁的表格與列表結構
    colleges_sections = soup.find_all("div", class_="colleges-box") or soup.find_all("tr")

    # 如果上述特徵未抓滿，我們直接用最穩健的結構遍歷：
    # 師大官網目前的排版是用表格(table)或特定 div 呈現，我們抓取所有學院標題
    college_blocks = soup.find_all(["h3", "h4", "div"], class_=lambda x: x and "title" in x.lower())
    
    # 實際動態解析官網中包含所有學院名稱的元件
    current_college = "未分類單位"
    
    # 為了確保百分之百精準度，我們掃描所有的元素
    main_content = soup.find("div", class_="static-content") or soup.body
    
    for element in main_content.find_all(["h3", "h4", "p", "a", "tr"]):
        text = element.get_text().strip()
        if not text:
            continue
            
        # 🎯 辨識學院：如果字尾是「學院」，就切換目前抓取的學院群組
        if "學院" in text and len(text) < 15 and "學系" not in text and "學程" not in text:
            # 清理學院名稱（例如：1. 教育學院 -> 教育學院）
            cleaned_college = text.split(".")[-1].split(" ")[-1].strip()
            current_college = cleaned_college
            if current_college not in result_data:
                result_data[current_college] = set()
            continue

        # 🎯 辨識科系與全學制班別（a 標籤通常是系所核心連結）
        if element.name == "a" and any(keyword in text for keyword in ["學系", "學位學程", "研究所"]):
            # 排除非系所導覽文字
            if any(exclude in text for exclude in ["網頁", "首頁", "進入", "回首頁", "網站"]):
                continue
                
            cleaned_dept = text.replace("\n", "").replace("\r", "").strip()
            
            if len(cleaned_dept) > 2:
                if current_college not in result_data:
                    result_data[current_college] = set()
                result_data[current_college].add(cleaned_dept)

    # 整理格式並排序
    final_output = []
    for college, depts in result_data.items():
        if not depts:
            continue
        sorted_depts = sorted(list(depts))
        final_output.append({
            "college": college,
            "departments": sorted_depts
        })
        
    # 排序學院
    final_output = sorted(final_output, key=lambda x: x["college"])

    print(f"\n🎉 爬取成功！共分類了 {len(final_output)} 個學院。")
    return final_output


if __name__ == "__main__":
    grouped_data = scrape_ntnu_by_college()

    # 輸出成 JSON 檔案
    output_filename = "ntnu_departments_by_college.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(grouped_data, f, ensure_ascii=False, indent=2)

    print(f"💾 成功將學院分類陣列資料寫入至: {output_filename}")
    
    # 預覽輸出結果
    for item in grouped_data[:2]:
        print(f"\n【{item['college']}】範例：")
        for d in item['departments'][:3]:
            print(f"  - {d}")
        print("  ...")