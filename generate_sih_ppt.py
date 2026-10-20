import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_drishti_sih_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]  # Blank slide

    # Asset paths
    sih_logo_path = os.path.abspath('extracted_assets/slide_1_img_6.png')
    sih_bulb_clean_path = os.path.abspath('extracted_assets/sih_bulb_clean.png')
    sih_brain_path = os.path.abspath('extracted_assets/slide_1_img_2.png')

    # Visual Workflow & Diagram Asset Paths
    slide2_wf_path = os.path.abspath('presentation_assets/slide2_workflow.png')
    slide2_inn_path = os.path.abspath('presentation_assets/slide2_innovations.png')
    slide2_orb_path = os.path.abspath('presentation_assets/slide2_orbital.png')
    slide2_wf_e2e_path = os.path.abspath('presentation_assets/slide2_workflow_e2e.png')
    slide2_inn_cards_path = os.path.abspath('presentation_assets/slide2_innovation_cards.png')
    slide2_complete_path = os.path.abspath('presentation_assets/slide2_proposed_solution_complete.png')
    slide3_arch_path = os.path.abspath('presentation_assets/slide3_architecture.png')
    slide4_mind_path = os.path.abspath('presentation_assets/slide4_mindmap.png')
    slide5_road_path = os.path.abspath('presentation_assets/slide5_roadmap.png')

    # Color Palette
    COLOR_NAVY = RGBColor(27, 54, 93)       # #1B365D - Title
    COLOR_TEAL = RGBColor(0, 126, 138)      # #007E8A - Accent & Boxes
    COLOR_DARK_TEAL = RGBColor(6, 78, 59)   # #064E3B
    COLOR_EMERALD = RGBColor(16, 185, 129)  # #10B981
    COLOR_DARK = RGBColor(15, 23, 42)       # #0F172A - Body text
    COLOR_MUTED = RGBColor(71, 85, 105)     # #475569
    COLOR_LIGHT_BG = RGBColor(248, 250, 252)# #F8FAFC
    COLOR_CARD_BORDER = RGBColor(203, 213, 225) # #CBD5E1
    COLOR_BLUE_ACCENT = RGBColor(2, 132, 199) # #0284C7
    COLOR_BANNER_BLUE = RGBColor(11, 105, 163) # #0B69A3 - Reference blue banner
    COLOR_AMBER = RGBColor(217, 119, 6)     # #D97706
    COLOR_ROSE = RGBColor(225, 29, 72)      # #E11D48
    COLOR_WHITE = RGBColor(255, 255, 255)

    def add_header(slide, title_text, slide_num=None, subtitle=None):
        # Team badge (top left)
        badge_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.18), Inches(1.3), Inches(0.72))
        badge_box.fill.solid()
        badge_box.fill.fore_color.rgb = COLOR_WHITE
        badge_box.line.color.rgb = COLOR_NAVY
        badge_box.line.width = Pt(1.8)
        tf_badge = badge_box.text_frame
        tf_badge.word_wrap = True
        tf_badge.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_badge = tf_badge.paragraphs[0]
        p_badge.text = "(DS)"
        p_badge.font.name = "Arial"
        p_badge.font.size = Pt(20)
        p_badge.font.bold = True
        p_badge.font.color.rgb = COLOR_NAVY
        p_badge.alignment = PP_ALIGN.CENTER

        # Center Title & optional Subtitle
        tx_box = slide.shapes.add_textbox(Inches(1.8), Inches(0.10), Inches(8.5), Inches(0.85))
        tf = tx_box.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Georgia"
        p.font.size = Pt(26)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY
        p.alignment = PP_ALIGN.CENTER

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = "Georgia"
            p_sub.font.size = Pt(11)
            p_sub.font.italic = True
            p_sub.font.color.rgb = COLOR_MUTED
            p_sub.alignment = PP_ALIGN.CENTER

        # Top Right SIH Logo
        if os.path.exists(sih_logo_path):
            slide.shapes.add_picture(sih_logo_path, Inches(10.5), Inches(0.15), width=Inches(2.4))

        # Bottom Right Slide Number
        if slide_num:
            num_box = slide.shapes.add_textbox(Inches(12.4), Inches(6.9), Inches(0.7), Inches(0.4))
            tf_num = num_box.text_frame
            p_num = tf_num.paragraphs[0]
            p_num.text = str(slide_num)
            p_num.font.name = "Arial"
            p_num.font.size = Pt(16)
            p_num.font.bold = True
            p_num.font.color.rgb = COLOR_TEAL
            p_num.alignment = PP_ALIGN.RIGHT

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    slide1 = prs.slides.add_slide(blank_layout)

    # Top Center Title
    tx_title = slide1.shapes.add_textbox(Inches(1.5), Inches(0.35), Inches(8.5), Inches(0.8))
    tf1 = tx_title.text_frame
    p1 = tf1.paragraphs[0]
    p1.text = "Smart India Hackathon 2024"
    p1.font.name = "Arial"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY
    p1.alignment = PP_ALIGN.CENTER

    # Top Right SIH Logo
    if os.path.exists(sih_logo_path):
        slide1.shapes.add_picture(sih_logo_path, Inches(10.2), Inches(0.2), width=Inches(2.7))

    # Left Side Details Box
    tx_meta = slide1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(6.5), Inches(5.2))
    tf_meta = tx_meta.text_frame
    tf_meta.word_wrap = True

    meta_items = [
        ("• Problem Statement ID:", " SIH1591 / PS26245"),
        ("• PS Title:", " AI-Powered Edge Video Analytics & Governance"),
        ("• Theme:", " Smart Automation / Governance & Skilling"),
        ("• PS Category:", " Software"),
        ("• Team ID:", " [Team ID]"),
        ("• Team Name:", " Drishti Innovators / HackSolvers")
    ]

    for idx, (label, val) in enumerate(meta_items):
        p = tf_meta.paragraphs[0] if idx == 0 else tf_meta.add_paragraph()
        p.space_before = Pt(18)
        run_l = p.add_run()
        run_l.text = label
        run_l.font.name = "Arial"
        run_l.font.size = Pt(20)
        run_l.font.bold = True
        run_l.font.color.rgb = COLOR_DARK

        run_v = p.add_run()
        run_v.text = val
        run_v.font.name = "Arial"
        run_v.font.size = Pt(20)
        run_v.font.bold = True
        run_v.font.color.rgb = COLOR_TEAL

    # Right Side: SIH Clean Brain/Bulb Graphic (Cropped, zero legacy text)
    if os.path.exists(sih_bulb_clean_path):
        slide1.shapes.add_picture(sih_bulb_clean_path, Inches(8.3), Inches(1.3), width=Inches(3.3))
    elif os.path.exists(sih_brain_path):
        slide1.shapes.add_picture(sih_brain_path, Inches(7.5), Inches(1.5), width=Inches(3.8))

    # Right Bottom: Project Title & Tagline
    tx_proj = slide1.shapes.add_textbox(Inches(7.2), Inches(5.3), Inches(5.5), Inches(1.4))
    tf_proj = tx_proj.text_frame
    tf_proj.word_wrap = True
    p_proj = tf_proj.paragraphs[0]
    p_proj.text = "Drishti-Skilling"
    p_proj.font.name = "Arial"
    p_proj.font.size = Pt(32)
    p_proj.font.bold = True
    p_proj.font.color.rgb = COLOR_BLUE_ACCENT
    p_proj.alignment = PP_ALIGN.CENTER

    p_tag = tf_proj.add_paragraph()
    p_tag.text = "~ Privacy-Preserving Edge AI Governance for Vocational Centres"
    p_tag.font.name = "Arial"
    p_tag.font.size = Pt(13)
    p_tag.font.color.rgb = COLOR_MUTED
    p_tag.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 2: PROPOSED SOLUTION
    # (Comprehensive 3-in-1 Dashboard: Gap Closure, Workflow & Uniqueness)
    # ==========================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_header(slide2, "DRISHTI-SKILLING", slide_num=None, subtitle="Privacy-Preserving Edge AI Governance for Vocational Centres")

    # Complete 3-in-1 High-Resolution Infographic Visual (Zero Empty Space)
    if os.path.exists(slide2_complete_path):
        slide2.shapes.add_picture(slide2_complete_path, Inches(0.35), Inches(1.02), width=Inches(12.63), height=Inches(6.32))

    # Slide number badge placed cleanly
    num_box2 = slide2.shapes.add_textbox(Inches(12.4), Inches(6.92), Inches(0.7), Inches(0.4))
    tf_num2 = num_box2.text_frame
    p_num2 = tf_num2.paragraphs[0]
    p_num2.text = "2"
    p_num2.font.name = "Arial"
    p_num2.font.size = Pt(16)
    p_num2.font.bold = True
    p_num2.font.color.rgb = COLOR_TEAL
    p_num2.alignment = PP_ALIGN.RIGHT

    # ==========================================
    # SLIDE 3: TECHNICAL APPROACH
    # ==========================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_header(slide3, "Technical Approach", slide_num=3)

    # Left Column: Tech Stack (Top) & Methodology (Bottom)
    tech_categories = [
        ("Edge AI & Vision", "BlazeFace 50 FPS De-ID\nYOLOv8-Nano Head Count\nCOCO Spatial Asset AI", COLOR_EMERALD, Inches(0.4), Inches(1.1)),
        ("Backend & API", "Node.js & Express REST\nFastAPI / Python Edge\nMQTT Telemetry Broker", COLOR_BLUE_ACCENT, Inches(3.6), Inches(1.1)),
        ("Frontend & GIS", "HTML5 & TailwindCSS\nLeaflet.js GIS Mapping\nChart.js Live Telemetry", COLOR_AMBER, Inches(0.4), Inches(2.4)),
        ("Security & DB", "DPDP Act 2023 RAM Shield\nScrypt Auth & Signed JWT\nSQLite & PostgreSQL", COLOR_TEAL, Inches(3.6), Inches(2.4))
    ]
    for cat_title, cat_items, cat_color, cx, cy in tech_categories:
        sh = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, Inches(3.0), Inches(1.15))
        sh.fill.solid()
        sh.fill.fore_color.rgb = COLOR_WHITE
        sh.line.color.rgb = cat_color
        sh.line.width = Pt(1.5)
        tf_cat = sh.text_frame
        tf_cat.margin_left = Inches(0.15)
        tf_cat.margin_top = Inches(0.1)
        p_c = tf_cat.paragraphs[0]
        p_c.text = cat_title
        p_c.font.bold = True
        p_c.font.size = Pt(10.5)
        p_c.font.color.rgb = cat_color

        for item in cat_items.split('\n'):
            p_i = tf_cat.add_paragraph()
            p_i.text = "• " + item
            p_i.font.size = Pt(8.5)
            p_i.font.color.rgb = COLOR_DARK

    # Methodology Box (Bottom Left)
    box_meth = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(3.7), Inches(6.2), Inches(3.2))
    box_meth.fill.solid()
    box_meth.fill.fore_color.rgb = COLOR_WHITE
    box_meth.line.color.rgb = COLOR_TEAL
    box_meth.line.width = Pt(1.5)

    tf_m = box_meth.text_frame
    tf_m.margin_left = Inches(0.25)
    tf_m.margin_top = Inches(0.18)
    p_m = tf_m.paragraphs[0]
    p_m.text = "Methodology and process for implementation"
    p_m.font.bold = True
    p_m.font.size = Pt(13)
    p_m.font.color.rgb = COLOR_TEAL

    method_steps = [
        ("➔ Core Architecture:", [
            "Edge Gateway: RTSP stream capture from existing classroom/lab CCTV.",
            "Volatile RAM De-ID: BlazeFace hardware downscaled inference (<12ms) with zero raw face storage.",
            "YOLO Headcount & Asset Check: Temporal 5-minute rolling average to suppress momentary false flags."
        ]),
        ("➔ Integration & Security:", [
            "Encrypted Telemetry: Transmits 2-5 KB JSON packets to cloud via MQTT/HTTPS.",
            "Automated SIP Reconciliation: Live cross-check against Skill India Portal batch roster.",
            "Security & Cryptography: Scrypt password hashing, JWT token authorization, and SHA-256 evidence signing."
        ])
    ]
    for section_title, bullets in method_steps:
        p_sec = tf_m.add_paragraph()
        p_sec.space_before = Pt(5)
        p_sec.text = section_title
        p_sec.font.bold = True
        p_sec.font.size = Pt(10)
        p_sec.font.color.rgb = COLOR_NAVY
        for b in bullets:
            p_b = tf_m.add_paragraph()
            p_b.text = "  ● " + b
            p_b.font.size = Pt(8.5)
            p_b.font.color.rgb = COLOR_DARK

    # Right Column: End-to-End System Pipeline Architecture Diagram
    if os.path.exists(slide3_arch_path):
        slide3.shapes.add_picture(slide3_arch_path, Inches(6.8), Inches(1.1), width=Inches(6.1))

    # ==========================================
    # SLIDE 4: FEASIBILITY & VIABILITY
    # ==========================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_header(slide4, "Feasibility & Viability", slide_num=4)

    # Upper Section: Feasibility Mindmap Diagram
    if os.path.exists(slide4_mind_path):
        slide4.shapes.add_picture(slide4_mind_path, Inches(0.5), Inches(1.05), width=Inches(12.3))

    # Lower Section: 4 Feasibility Cards
    f_cards = [
        ("TECHNICAL FEASIBILITY", [
            "Reuses standard RTSP CCTV / DVRs.",
            "INT8 YOLOv8 runs 25+ FPS locally.",
            "BlazeFace 50 FPS de-identification.",
            "Working MVP deployed on Vercel."
        ], COLOR_BLUE_ACCENT, Inches(0.5)),
        ("MARKET & SCALE FEASIBILITY", [
            "Applies to 15,000+ national centres.",
            "Extensible to ITIs, PMKVY, DGT, polytechnics.",
            "Dockerized OTA automated deployment.",
            "10-minute web setup wizard."
        ], COLOR_TEAL, Inches(3.6)),
        ("FINANCIAL FEASIBILITY", [
            "Low CapEx: ~₹6,500 edge unit per centre.",
            "OpEx <₹80/mo (replaces ₹1,800 streaming).",
            "Saves ₹100+ Cr in ghost stipend fraud.",
            "Cuts physical audit travel by 75%."
        ], COLOR_AMBER, Inches(6.7)),
        ("OPERATIONAL & REGULATORY", [
            "100% compliant with DPDP Act 2023.",
            "Zero biometric or Aadhaar storage.",
            "Ensures rural youth get real trade skills.",
            "Accelerates payouts for ethical partners."
        ], COLOR_EMERALD, Inches(9.8))
    ]
    for f_title, f_bullets, f_col, fx in f_cards:
        f_box = slide4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx, Inches(4.55), Inches(2.95), Inches(2.05))
        f_box.fill.solid()
        f_box.fill.fore_color.rgb = COLOR_WHITE
        f_box.line.color.rgb = f_col
        f_box.line.width = Pt(1.5)
        tf_f = f_box.text_frame
        tf_f.margin_left = Inches(0.15)
        tf_f.margin_top = Inches(0.12)
        p_ft = tf_f.paragraphs[0]
        p_ft.text = f_title
        p_ft.font.bold = True
        p_ft.font.size = Pt(9.5)
        p_ft.font.color.rgb = f_col

        for b in f_bullets:
            p_b = tf_f.add_paragraph()
            p_b.text = "• " + b
            p_b.font.size = Pt(8.2)
            p_b.font.color.rgb = COLOR_DARK

    # Bottom link
    tx_link4 = slide4.shapes.add_textbox(Inches(3.0), Inches(6.75), Inches(7.3), Inches(0.35))
    tf_l4 = tx_link4.text_frame
    p_l4 = tf_l4.paragraphs[0]
    p_l4.text = "Interactive System Prototype: https://drishti-skilling.vercel.app/"
    p_l4.font.bold = True
    p_l4.font.size = Pt(9.5)
    p_l4.font.color.rgb = COLOR_BLUE_ACCENT
    p_l4.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 5: IMPACT AND BENEFITS
    # ==========================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_header(slide5, "Impact and Benefits", slide_num=5)

    # Left Column: Potential Impact & Benefits of Solution
    tx_imp_head = slide5.shapes.add_textbox(Inches(0.5), Inches(1.05), Inches(5.8), Inches(0.45))
    tf_ih = tx_imp_head.text_frame
    p_ih = tf_ih.paragraphs[0]
    p_ih.text = "🌍 Potential Impact & Benefits of Solution"
    p_ih.font.bold = True
    p_ih.font.size = Pt(14)
    p_ih.font.color.rgb = COLOR_TEAL

    impact_cards = [
        ("01", "Plugs Ghost Trainee Leakages", "Stops ₹100+ Crores in fraudulent stipend claims; halts illegal payouts automatically."),
        ("02", "Guarantees Real Youth Skills", "Enforces mandatory physical trainer presence & hands-on equipment practice for trainees."),
        ("03", "99.4% Rural Bandwidth Reduction", "Operates smoothly on 2G/3G links with 2-5 KB JSON metrics; saves millions in streaming bills."),
        ("04", "100% DPDP Act 2023 Compliance", "Volatile RAM face-blurring guarantees zero citizen facial biometrics stored or leaked."),
        ("05", "75% Audit Travel Cost Reduction", "Objective risk triage directs flying squads only to red-flagged hotspot centres."),
        ("06", "Faster Payouts for Ethical Centres", "Automated compliance index clears verified training centres for rapid subsidy disbursement.")
    ]
    for idx, (num, title, desc) in enumerate(impact_cards):
        y_pos = Inches(1.55 + idx * 0.85)

        # Number circle badge
        c_num = slide5.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.5), y_pos + Inches(0.08), Inches(0.55), Inches(0.55))
        c_num.fill.solid()
        c_num.fill.fore_color.rgb = COLOR_DARK
        c_num.line.fill.background()
        tf_cn = c_num.text_frame
        tf_cn.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_cn = tf_cn.paragraphs[0]
        p_cn.text = num
        p_cn.font.bold = True
        p_cn.font.size = Pt(11)
        p_cn.font.color.rgb = COLOR_WHITE
        p_cn.alignment = PP_ALIGN.CENTER

        # Benefit pill card
        card_b = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), y_pos, Inches(5.0), Inches(0.72))
        card_b.fill.solid()
        card_b.fill.fore_color.rgb = COLOR_LIGHT_BG
        card_b.line.color.rgb = COLOR_CARD_BORDER
        card_b.line.width = Pt(1)
        tf_cb = card_b.text_frame
        tf_cb.margin_left = Inches(0.18)
        tf_cb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_cbt = tf_cb.paragraphs[0]
        p_cbt.text = title
        p_cbt.font.bold = True
        p_cbt.font.size = Pt(10)
        p_cbt.font.color.rgb = COLOR_NAVY
        p_cbd = tf_cb.add_paragraph()
        p_cbd.text = desc
        p_cbd.font.size = Pt(8)
        p_cbd.font.color.rgb = COLOR_MUTED

    # Right Column: Roadmap & Future Goals (Agile Sprints Diagram)
    tx_road_head = slide5.shapes.add_textbox(Inches(6.8), Inches(1.05), Inches(4.5), Inches(0.45))
    tf_rh = tx_road_head.text_frame
    tf_rh.margin_left = 0
    tf_rh.margin_top = 0
    p_rh = tf_rh.paragraphs[0]
    p_rh.text = "💡 Roadmap & Future Goals (Deployment Sprints)"
    p_rh.font.bold = True
    p_rh.font.size = Pt(13.5)
    p_rh.font.color.rgb = COLOR_TEAL

    # Embed 6-Sprint Snake Roadmap Diagram
    if os.path.exists(slide5_road_path):
        slide5.shapes.add_picture(slide5_road_path, Inches(6.8), Inches(1.5), width=Inches(5.8))

    # ==========================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # ==========================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_header(slide6, "Research and References", slide_num=6)

    # Main Reference Container Box
    box_ref = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.1), Inches(12.3), Inches(5.8))
    box_ref.fill.solid()
    box_ref.fill.fore_color.rgb = COLOR_WHITE
    box_ref.line.color.rgb = COLOR_TEAL
    box_ref.line.width = Pt(1.5)

    tf_ref = box_ref.text_frame
    tf_ref.margin_left = Inches(0.35)
    tf_ref.margin_top = Inches(0.25)
    p_rt = tf_ref.paragraphs[0]
    p_rt.text = "Details / Links of the reference and research work"
    p_rt.font.bold = True
    p_rt.font.size = Pt(15)
    p_rt.font.color.rgb = COLOR_TEAL

    citations = [
        ("1. Comptroller and Auditor General of India (CAG): ",
         "Performance Audit on National Skill Development Mission (Report No. 10 of 2018), documenting 25-35% variance between reported trainee rosters and physical classroom occupancy in unmonitored centres."),

        ("2. Ministry of Skill Development and Entrepreneurship (MSDE): ",
         "Guidelines for Empanelment & Continuous Monitoring of Training Centres (PMKVY 4.0 / DGT Norms), specifying mandatory trainer-trainee ratios, equipment checklists, and biometric audit requirements."),

        ("3. Digital Personal Data Protection Act, 2023 (DPDP Act): ",
         "Act No. 22 of 2023, Gazette of India, Section 6 & 8 (Data Minimization & Purpose Limitation Principles), mandating edge-level de-identification and prohibiting continuous storage of raw facial biometrics."),

        ("4. Ultralytics & Google Research (Edge Vision Benchmarks): ",
         "YOLOv8-Nano and BlazeFace Real-Time Performance on Resource-Constrained Embedded Devices (Edge TPUs and Intel N100 Mini-PCs), demonstrating 25-50 FPS throughput at sub-15W power envelope."),

        ("5. Ministry of Electronics and Information Technology (MeitY): ",
         "IoT & Edge AI Architectural Guidelines for Public Sector Service Delivery, emphasizing local compute, store-and-forward telemetry, and cryptographic verification of audit records."),

        ("6. National Skill Development Corporation (NSDC): ",
         "Standard Operating Procedures for Skill India Digital Hub (SIDH) Batch Accreditation & Verification, detailing API interfaces for third-party automated discrepancy reporting."),

        ("7. Drishti-Skilling Production Platform & Verifiable Codebase: ",
         "Live Web Platform: https://drishti-skilling.vercel.app/ | Architecture & Audit Test Suite: https://github.com/aetherpixels/drishti-skilling (17/17 Security & RBAC automated audit tests passing).")
    ]

    for idx, (auth, text) in enumerate(citations):
        p_c = tf_ref.add_paragraph()
        p_c.space_before = Pt(10)
        run_a = p_c.add_run()
        run_a.text = auth
        run_a.font.name = "Arial"
        run_a.font.size = Pt(10.5)
        run_a.font.bold = True
        run_a.font.color.rgb = COLOR_NAVY

        run_t = p_c.add_run()
        run_t.text = text
        run_t.font.name = "Arial"
        run_t.font.size = Pt(10)
        run_t.font.color.rgb = COLOR_DARK

    # Save presentation
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"Successfully generated presentation at: {output_path}")

if __name__ == "__main__":
    out_file = os.path.abspath("presentation/Drishti_Skilling_SIH2024_Presentation.pptx")
    create_drishti_sih_presentation(out_file)
    alt_file = os.path.abspath("presentation/SIH2026_PS26245_Drishti_Skilling_Presentation.pptx")
    try:
        create_drishti_sih_presentation(alt_file)
    except PermissionError:
        backup_file = os.path.abspath("presentation/Drishti_Skilling_SIH_Final.pptx")
        create_drishti_sih_presentation(backup_file)
        print(f"Notice: {alt_file} is currently locked by PowerPoint. Saved copy to {backup_file}")
