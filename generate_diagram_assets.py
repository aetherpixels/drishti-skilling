import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Polygon

os.makedirs('presentation_assets', exist_ok=True)

# ----------------------------------------------------------------------
# Helper: Draw vector symbols instead of emojis
# ----------------------------------------------------------------------
def draw_icon_badge(ax, x, y, badge_type, color='#0284C7', symbol_color='white', radius=0.32):
    circ = Circle((x, y), radius, facecolor=color, edgecolor=symbol_color if color=='white' else 'white', linewidth=1.8, zorder=4)
    ax.add_patch(circ)
    
    # Inner symbol in symbol_color
    if badge_type == 'cam':
        rect = FancyBboxPatch((x - 0.15, y - 0.1), 0.22, 0.2, boxstyle="round,pad=0.02", facecolor=symbol_color, zorder=5)
        ax.add_patch(rect)
        poly = Polygon([[x + 0.08, y - 0.08], [x + 0.18, y - 0.14], [x + 0.18, y + 0.14], [x + 0.08, y + 0.08]], facecolor=symbol_color, zorder=5)
        ax.add_patch(poly)
    elif badge_type == 'shield':
        poly = Polygon([[x - 0.14, y + 0.12], [x + 0.14, y + 0.12], [x + 0.14, y - 0.02], [x, y - 0.16], [x - 0.14, y - 0.02]], facecolor=symbol_color, zorder=5)
        ax.add_patch(poly)
    elif badge_type == 'zap':
        poly = Polygon([[x - 0.02, y + 0.16], [x - 0.12, y], [x + 0.02, y], [x - 0.02, y - 0.16], [x + 0.12, y + 0.02], [x - 0.02, y + 0.02]], facecolor=symbol_color, zorder=5)
        ax.add_patch(poly)
    elif badge_type == 'cap':
        poly = Polygon([[x, y + 0.14], [x + 0.16, y + 0.04], [x, y - 0.06], [x - 0.16, y + 0.04]], facecolor=symbol_color, zorder=5)
        ax.add_patch(poly)
        rect = patches.Rectangle((x - 0.08, y - 0.12), 0.16, 0.08, facecolor=symbol_color, zorder=5)
        ax.add_patch(rect)
    elif badge_type == 'users':
        c1 = Circle((x - 0.06, y + 0.06), 0.06, facecolor=symbol_color, zorder=5)
        c2 = Circle((x + 0.06, y + 0.06), 0.06, facecolor=symbol_color, zorder=5)
        ax.add_patch(c1)
        ax.add_patch(c2)
        poly = Polygon([[x - 0.14, y - 0.12], [x + 0.14, y - 0.12], [x + 0.1, y - 0.02], [x - 0.1, y - 0.02]], facecolor=symbol_color, zorder=5)
        ax.add_patch(poly)
    elif badge_type == 'gear':
        cg = Circle((x, y), 0.13, facecolor=symbol_color, zorder=5)
        ci = Circle((x, y), 0.05, facecolor=color, zorder=6)
        ax.add_patch(cg)
        ax.add_patch(ci)
    elif badge_type == 'map':
        poly = Polygon([[x, y - 0.15], [x + 0.11, y + 0.05], [x - 0.11, y + 0.05]], facecolor=symbol_color, zorder=5)
        cm = Circle((x, y + 0.06), 0.11, facecolor=symbol_color, zorder=5)
        ci = Circle((x, y + 0.06), 0.04, facecolor=color, zorder=6)
        ax.add_patch(poly)
        ax.add_patch(cm)
        ax.add_patch(ci)
    elif badge_type == 'db':
        for dy in [0.08, 0.0, -0.08]:
            ell = patches.Ellipse((x, y + dy), 0.22, 0.07, facecolor=symbol_color, zorder=5)
            ax.add_patch(ell)
    elif badge_type == 'lock':
        rect = FancyBboxPatch((x - 0.1, y - 0.14), 0.2, 0.16, boxstyle="round,pad=0.02", facecolor=symbol_color, zorder=5)
        ax.add_patch(rect)
        arc = patches.Arc((x, y + 0.02), 0.14, 0.16, angle=0, theta1=0, theta2=180, edgecolor=symbol_color, lw=2.5, zorder=5)
        ax.add_patch(arc)
    else:
        # Default circle tag with letter
        ax.text(x, y, badge_type[:2].upper(), fontsize=9, fontweight='bold', color=symbol_color, va='center', ha='center', zorder=5)

# ----------------------------------------------------------------------
# DIAGRAM 1: SLIDE 2 - "How it addresses the problem" Flowchart
# ----------------------------------------------------------------------
def render_slide2_workflow():
    fig, ax = plt.subplots(figsize=(8.5, 3.4), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4.0)
    ax.axis('off')

    c_blue = '#0284C7'
    c_green = '#10B981'
    c_amber = '#F59E0B'
    c_purple = '#8B5CF6'
    c_teal = '#0D9488'
    c_dark = '#0F172A'
    c_bg = '#F8FAFC'

    # Outer container box
    outer = FancyBboxPatch((0.15, 0.15), 9.7, 3.7,
                           boxstyle="round,pad=0.08,rounding_size=0.18",
                           facecolor='white', edgecolor='#007E8A', linewidth=1.5)
    ax.add_patch(outer)

    nodes = [
        ("Automated CCTV\nClassroom Ingestion", 1.8, 2.7, c_blue, 'cam'),
        ("Plugs Ghost Trainee\nStipend Fraud", 5.0, 2.7, c_amber, 'shield'),
        ("Guarantees Real\nTraining Hours", 8.2, 2.7, c_purple, 'cap'),
        ("Ultra-Low 2G/3G\nBandwidth (2 KB)", 2.8, 1.0, c_teal, 'zap'),
        ("Bridge B/w Training\nCentres & MSDE", 7.2, 1.0, c_green, 'users')
    ]

    for label, x, y, col, icon_type in nodes:
        box = FancyBboxPatch((x - 1.25, y - 0.48), 2.5, 0.96,
                             boxstyle="round,pad=0.08,rounding_size=0.15",
                             facecolor=c_bg, edgecolor=col, linewidth=1.8)
        ax.add_patch(box)
        draw_icon_badge(ax, x - 0.85, y, icon_type, color=col, radius=0.24)
        ax.text(x + 0.35, y, label, fontsize=8.0, fontweight='bold', color=c_dark,
                va='center', ha='center', linespacing=1.15)

    def draw_arrow(p1, p2):
        arrow = FancyArrowPatch(p1, p2, arrowstyle='-|>', mutation_scale=14,
                                color='#94A3B8', linewidth=1.8, linestyle='solid')
        ax.add_patch(arrow)

    draw_arrow((3.1, 2.7), (3.7, 2.7))
    draw_arrow((6.3, 2.7), (6.9, 2.7))
    draw_arrow((2.1, 2.2), (2.5, 1.5))
    draw_arrow((4.1, 1.0), (5.9, 1.0))
    draw_arrow((7.5, 1.5), (7.9, 2.2))

    plt.tight_layout()
    out_path = 'presentation_assets/slide2_workflow.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 2: SLIDE 2 - "Innovation & Uniqueness" Horizontal Pin Callouts
# ----------------------------------------------------------------------
def render_slide2_innovations():
    fig, ax = plt.subplots(figsize=(8.5, 3.4), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(-1.7, 1.7)
    ax.axis('off')

    # Outer container box
    outer = FancyBboxPatch((0.15, -1.6), 9.7, 3.2,
                           boxstyle="round,pad=0.08,rounding_size=0.18",
                           facecolor='white', edgecolor='#007E8A', linewidth=1.5)
    ax.add_patch(outer)

    ax.plot([0.6, 9.4], [0, 0], color='#CBD5E1', linestyle='--', linewidth=2.0, zorder=1)

    pins = [
        (1.1, 1, "50 FPS Edge De-ID", "Volatile RAM face-blurring\ncompliant with DPDP 2023", "#0284C7", 'shield'),
        (3.0, -1, "Sub-₹7k Mini-PC", "Low-cost edge inference\nreplaces expensive GPUs", "#10B981", 'zap'),
        (5.0, 1, "72-Hr Store & Forward", "Zero data loss during rural\nbroadband/power cuts", "#F59E0B", 'db'),
        (7.0, -1, "Spatial Asset YOLO", "Detects mandatory trade tools\n& approved workbenches", "#8B5CF6", 'gear'),
        (8.9, 1, "National GIS Portal", "Interactive heatmap with\nScrypt/JWT audit trails", "#EC4899", 'map')
    ]

    for x, direction, title, desc, col, icon_type in pins:
        y_node = 0.65 if direction == 1 else -0.65
        ax.plot([x, x], [0, y_node], color=col, linewidth=2.0, zorder=2)
        dot = Circle((x, 0), 0.07, facecolor=col, edgecolor='white', linewidth=1.5, zorder=3)
        ax.add_patch(dot)

        draw_icon_badge(ax, x, y_node, icon_type, color=col, radius=0.26)

        y_text = 1.05 if direction == 1 else -1.05
        ax.text(x, y_text, title, fontsize=8.0, fontweight='bold', color='#0F172A',
                va='center', ha='center')
        y_sub = 1.35 if direction == 1 else -1.35
        ax.text(x, y_sub, desc, fontsize=6.5, color='#475569',
                va='center', ha='center', linespacing=1.05)

    plt.tight_layout()
    out_path = 'presentation_assets/slide2_innovations.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 3: SLIDE 2 - Bottom Left Orbital Feature Chain
# ----------------------------------------------------------------------
def render_slide2_orbital():
    fig, ax = plt.subplots(figsize=(9, 1.8), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 2)
    ax.axis('off')

    xs = [1.0, 2.6, 4.2, 5.8, 7.4, 9.0]
    ys = [1.0, 1.25, 1.35, 1.35, 1.25, 1.0]
    ax.plot(xs, ys, color='#CBD5E1', linestyle='-', linewidth=2.0, zorder=1)

    badges = [
        (1.0, 1.0, "Edge Face Blur\n(DPDP Shield)", "#0284C7", 'shield'),
        (2.6, 1.25, "YOLO Headcount\n(Student Count)", "#10B981", 'users'),
        (4.2, 1.35, "Spatial Asset Audit\n(Approved Tools)", "#F59E0B", 'gear'),
        (5.8, 1.35, "2-5 KB Telemetry\n(99.4% Saved)", "#0D9488", 'zap'),
        (7.4, 1.25, "SIP Reconciliation\n(Batch Roster)", "#6366F1", 'db'),
        (9.0, 1.0, "Anti-Tamper AI\n(Angle Guard)", "#EC4899", 'cam')
    ]

    for x, y, label, col, icon_type in badges:
        draw_icon_badge(ax, x, y, icon_type, color=col, radius=0.34)
        ax.text(x, y - 0.65, label, fontsize=7.5, fontweight='bold', color='#1E293B',
                va='center', ha='center', linespacing=1.1)

    plt.tight_layout()
    out_path = 'presentation_assets/slide2_orbital.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 4: SLIDE 3 - End-to-End System Architecture Diagram
# ----------------------------------------------------------------------
def render_slide3_architecture():
    fig, ax = plt.subplots(figsize=(10.5, 8.8), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 10)
    ax.axis('off')

    c_box_bg = '#F8FAFC'
    c_dark = '#0F172A'

    # Outer Container
    outer = FancyBboxPatch((0.2, 0.2), 11.6, 9.6,
                           boxstyle="round,pad=0.2,rounding_size=0.2",
                           facecolor='white', edgecolor='#0284C7', linewidth=2.0)
    ax.add_patch(outer)
    ax.text(6.0, 9.45, "DRISHTI-SKILLING: END-TO-END SYSTEM PIPELINE ARCHITECTURE",
            fontsize=12, fontweight='bold', color='#1B365D', ha='center', va='center')

    # 1. CLIENT APPLICATION (Top Left)
    box_client = FancyBboxPatch((0.5, 5.5), 2.8, 3.6,
                                boxstyle="round,pad=0.1,rounding_size=0.15",
                                facecolor=c_box_bg, edgecolor='#94A3B8', linewidth=1.5)
    ax.add_patch(box_client)
    ax.text(1.9, 8.8, "CLIENT APPLICATION", fontsize=9.5, fontweight='bold', color='#475569', ha='center')

    client_items = [
        ("Web Dashboard\n(Desktop Officer View)", 7.8, 'map'),
        ("Mobile View\n(Auditor Field Tablet)", 6.7, 'users'),
        ("Classroom CCTV / RTSP\n(Edge Sensing IP Cam)", 5.6, 'cam')
    ]
    for name, cy, icon_type in client_items:
        ibox = FancyBboxPatch((0.7, cy - 0.35), 2.4, 0.75, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#CBD5E1', linewidth=1)
        ax.add_patch(ibox)
        draw_icon_badge(ax, 1.0, cy, icon_type, color='#0284C7', radius=0.2)
        ax.text(1.32, cy, name, fontsize=7.2, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.1)

    # 2. SECURITY LAYER (Bottom Left)
    box_sec = FancyBboxPatch((0.5, 0.6), 2.8, 4.4,
                             boxstyle="round,pad=0.1,rounding_size=0.15",
                             facecolor=c_box_bg, edgecolor='#10B981', linewidth=1.5)
    ax.add_patch(box_sec)
    ax.text(1.9, 4.7, "SECURITY & DPDP GUARD", fontsize=9.5, fontweight='bold', color='#064E3B', ha='center')

    sec_items = [
        ("OAuth / Scrypt Auth\n(Hashed Credentials)", 3.9, 'lock'),
        ("RBAC Action Guard\n(Auditor / Admin Token)", 2.9, 'shield'),
        ("Signed JWT Tokens\n(1-Hour Session Expiry)", 1.9, 'shield'),
        ("DPDP 2023 Shield\n(Volatile RAM De-ID)", 0.9, 'lock')
    ]
    for name, cy, icon_type in sec_items:
        ibox = FancyBboxPatch((0.7, cy - 0.32), 2.4, 0.68, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#10B981', linewidth=1)
        ax.add_patch(ibox)
        draw_icon_badge(ax, 1.0, cy, icon_type, color='#10B981', radius=0.19)
        ax.text(1.32, cy, name, fontsize=7.0, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.1)

    # 3. QUEUE & CLOUD INFRASTRUCTURE (Top Center)
    box_queue = FancyBboxPatch((3.7, 7.3), 4.6, 1.8,
                               boxstyle="round,pad=0.1,rounding_size=0.15",
                               facecolor=c_box_bg, edgecolor='#6366F1', linewidth=1.5)
    ax.add_patch(box_queue)
    ax.text(6.0, 8.8, "QUEUE & TELEMETRY STREAMING", fontsize=9.5, fontweight='bold', color='#4338CA', ha='center')

    q_items = [
        ("MQTT Broker\n(2 KB JSON)", 4.8, 7.9, 'zap'),
        ("Kafka Streams\n(Audit Events)", 7.2, 7.9, 'db')
    ]
    for name, qx, qy, icon_type in q_items:
        bx = qx - 1.0
        qbox = FancyBboxPatch((bx, qy - 0.35), 2.0, 0.75, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#6366F1', linewidth=1)
        ax.add_patch(qbox)
        draw_icon_badge(ax, bx + 0.32, qy, icon_type, color='#6366F1', radius=0.20)
        ax.text(bx + 0.62, qy, name, fontsize=7.2, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.1)

    # 4. MAIN SERVER & CORE ENGINE (Middle Center)
    box_server = FancyBboxPatch((3.7, 3.1), 4.6, 3.8,
                                boxstyle="round,pad=0.1,rounding_size=0.15",
                                facecolor=c_box_bg, edgecolor='#0284C7', linewidth=2.0)
    ax.add_patch(box_server)
    ax.text(6.0, 6.6, "MAIN SERVER: RECONCILIATION & TRIAGE", fontsize=10, fontweight='bold', color='#0369A1', ha='center')

    srv_items = [
        ("API Gateway / Routing\n(Express REST)", 4.8, 5.7, 'zap'),
        ("Timetable Matcher\n(Variance Calculation)", 7.2, 5.7, 'shield'),
        ("Redis Memory Cache\n(5-Min Moving Avg)", 4.8, 4.4, 'zap'),
        ("PostgreSQL Database\n(Telemetry & Logs)", 7.2, 4.4, 'db'),
        ("Evidence Vault Engine\n(SHA-256 Signatures)", 6.0, 3.4, 'lock')
    ]
    for name, sx, sy, icon_type in srv_items:
        w_box = 2.0 if sx != 6.0 else 4.2
        bx = sx - w_box / 2
        sbox = FancyBboxPatch((bx, sy - 0.3), w_box, 0.65, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#0284C7', linewidth=1)
        ax.add_patch(sbox)
        draw_icon_badge(ax, bx + 0.32, sy, icon_type, color='#0284C7', radius=0.19)
        ax.text(bx + 0.62, sy, name, fontsize=6.8, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.05)

    # 5. EXTERNAL SERVICES (Bottom Center)
    box_ext = FancyBboxPatch((3.7, 0.6), 4.6, 2.1,
                             boxstyle="round,pad=0.1,rounding_size=0.15",
                             facecolor=c_box_bg, edgecolor='#D97706', linewidth=1.5)
    ax.add_patch(box_ext)
    ax.text(6.0, 2.45, "EXTERNAL INTEGRATIONS", fontsize=9.5, fontweight='bold', color='#B45309', ha='center')

    ext_items = [
        ("MSDE Skill India Portal (SIP)\n(Batch Schedules & Rosters)", 3.85, 2.15, 1.55, 'cap'),
        ("SMS / Email Alert Gateway\n(Emergency Tamper Triage)", 6.15, 2.0, 1.55, 'zap')
    ]
    for name, bx, bw, ey, icon_type in ext_items:
        ebox = FancyBboxPatch((bx, ey - 0.35), bw, 0.72, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#D97706', linewidth=1)
        ax.add_patch(ebox)
        draw_icon_badge(ax, bx + 0.28, ey, icon_type, color='#D97706', radius=0.18)
        ax.text(bx + 0.52, ey, name, fontsize=6.2, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.05)

    # 6. MICROSERVICES COLUMN (Far Right)
    box_micro = FancyBboxPatch((8.7, 0.6), 2.9, 8.5,
                               boxstyle="round,pad=0.1,rounding_size=0.15",
                               facecolor=c_box_bg, edgecolor='#8B5CF6', linewidth=1.5)
    ax.add_patch(box_micro)
    ax.text(10.15, 8.8, "MICROSERVICES LAYER", fontsize=10, fontweight='bold', color='#5B21B6', ha='center')

    micro_items = [
        ("Discrepancy Triage\n(Level 1, 2, 3 Flags)", 7.8, 'shield'),
        ("Evidence Vault\n(De-ID Snapshots)", 6.5, 'lock'),
        ("Compliance Scoring\n(0-100 Rating)", 5.2, 'cap'),
        ("Timetable Service\n(Batch Reconciliation)", 3.9, 'db'),
        ("Asset Audit Service\n(YOLOv8 Tool Mapping)", 2.6, 'gear'),
        ("Alert & Notification\n(Flying Squad Triage)", 1.3, 'zap')
    ]
    for name, my, icon_type in micro_items:
        mbox = FancyBboxPatch((8.9, my - 0.42), 2.5, 0.85, boxstyle="round,pad=0.08,rounding_size=0.1",
                              facecolor='white', edgecolor='#8B5CF6', linewidth=1.2)
        ax.add_patch(mbox)
        draw_icon_badge(ax, 9.25, my, icon_type, color='#8B5CF6', radius=0.22)
        ax.text(9.58, my, name, fontsize=7.2, fontweight='bold', color=c_dark, va='center', ha='left', linespacing=1.05)

    # Flow Arrows
    def draw_farrow(p1, p2):
        arr = FancyArrowPatch(p1, p2, arrowstyle='-|>', mutation_scale=14,
                              color='#64748B', linewidth=1.8, linestyle='solid')
        ax.add_patch(arr)

    draw_farrow((1.9, 5.5), (1.9, 5.0))
    draw_farrow((3.3, 3.9), (3.7, 3.9))
    draw_farrow((6.0, 6.9), (6.0, 7.3))
    draw_farrow((6.0, 3.1), (6.0, 2.7))
    draw_farrow((8.3, 5.0), (8.7, 5.0))

    plt.tight_layout()
    out_path = 'presentation_assets/slide3_architecture.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 5: SLIDE 4 - Feasibility & Viability Branching Mindmap
# ----------------------------------------------------------------------
def render_slide4_mindmap():
    fig, ax = plt.subplots(figsize=(12.5, 3.4), dpi=300)
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 3.5)
    ax.axis('off')

    # Center Hub
    hub = FancyBboxPatch((4.9, 1.15), 2.2, 1.1, boxstyle="round,pad=0.1,rounding_size=0.55",
                         facecolor='white', edgecolor='#F59E0B', linewidth=3.0)
    ax.add_patch(hub)
    ax.text(6.0, 1.7, "Feasibility\n&\nViability", fontsize=11, fontweight='bold',
            color='#B45309', ha='center', va='center', linespacing=1.1)

    # Left Header: Challenges & Risks
    l_hdr = FancyBboxPatch((0.4, 2.75), 4.3, 0.55, boxstyle="round,pad=0.08,rounding_size=0.25",
                           facecolor='#F59E0B', edgecolor='white', linewidth=1.5)
    ax.add_patch(l_hdr)
    ax.text(2.55, 3.02, "Potential Challenges & Risks", fontsize=9.5, fontweight='bold', color='white', ha='center', va='center')

    # Connector Hub -> Left Header
    ax.annotate("", xy=(4.7, 3.02), xytext=(5.1, 2.1),
                arrowprops=dict(arrowstyle="-", color='#F59E0B', lw=2.2, connectionstyle="arc3,rad=-0.12"))

    # 4 Challenge cards (2x2 grid)
    l_cards = [
        ("OPERATIONAL", "Rural internet cuts;\nno IT staff at ITIs", 0.4, 1.45),
        ("TECHNICAL", "High-res video bottlenecks\n2G; camera blinding", 2.6, 1.45),
        ("FINANCIAL", "Cloud GPU costs;\nexpensive hardware", 0.4, 0.25),
        ("REGULATORY", "Biometric facial privacy\nrisks under DPDP 2023", 2.6, 0.25)
    ]
    for tag, desc, bx, by in l_cards:
        b = FancyBboxPatch((bx, by), 2.1, 1.0, boxstyle="round,pad=0.08,rounding_size=0.12",
                           facecolor='#FFFBEB', edgecolor='#FCD34D', linewidth=1.3)
        ax.add_patch(b)
        ax.text(bx + 0.15, by + 0.72, tag, fontsize=7.8, fontweight='bold', color='#B45309')
        ax.text(bx + 0.15, by + 0.35, desc, fontsize=6.8, color='#0F172A', linespacing=1.1)

    # Right Header: Strategies for Overcoming
    r_hdr = FancyBboxPatch((7.3, 2.75), 4.3, 0.55, boxstyle="round,pad=0.08,rounding_size=0.25",
                           facecolor='#10B981', edgecolor='white', linewidth=1.5)
    ax.add_patch(r_hdr)
    ax.text(9.45, 3.02, "Strategies for Overcoming", fontsize=9.5, fontweight='bold', color='white', ha='center', va='center')

    # Connector Hub -> Right Header
    ax.annotate("", xy=(7.3, 3.02), xytext=(6.9, 2.1),
                arrowprops=dict(arrowstyle="-", color='#10B981', lw=2.2, connectionstyle="arc3,rad=0.12"))

    # 4 Strategy cards (2x2 grid)
    r_cards = [
        ("TECHNICAL", "Edge AI pushes 2 KB JSON\n(99.4% saved); tamper AI", 7.3, 1.45),
        ("OPERATIONAL", "72-hr SQLite store & forward;\nplug-and-play unit", 9.5, 1.45),
        ("FINANCIAL", "Quantized INT8 on ₹7k PC;\n<₹80/mo cloud", 7.3, 0.25),
        ("REGULATORY", "RAM face-blurring;\nzero biometric vectors", 9.5, 0.25)
    ]
    for tag, desc, bx, by in r_cards:
        b = FancyBboxPatch((bx, by), 2.1, 1.0, boxstyle="round,pad=0.08,rounding_size=0.12",
                           facecolor='#ECFDF5', edgecolor='#6EE7B7', linewidth=1.3)
        ax.add_patch(b)
        ax.text(bx + 0.15, by + 0.72, tag, fontsize=7.8, fontweight='bold', color='#047857')
        ax.text(bx + 0.15, by + 0.35, desc, fontsize=6.8, color='#0F172A', linespacing=1.1)

    plt.tight_layout()
    out_path = 'presentation_assets/slide4_mindmap.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 6: SLIDE 5 - 6-Sprint Agile Snake Roadmap
# ----------------------------------------------------------------------
def render_slide5_roadmap():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)
    ax.axis('off')

    c_dark = '#0F172A'

    top_sprints = [
        (1.6, 4.8, "Sprint 1", "CORE EDGE AI",
         ["• Real-time CCTV RTSP capture", "• 50 FPS face de-identification", "• Volatile RAM DPDP shield"],
         '#6366F1'),
        (5.0, 4.8, "Sprint 2", "HEADCOUNT & ASSETS",
         ["• YOLOv8 spatial headcount", "• Sanctioned tool detection", "• 5-min rolling average filter"],
         '#0284C7'),
        (8.4, 4.8, "Sprint 3", "OFFLINE RESILIENCE",
         ["• 72-hr SQLite store & forward", "• 2-5 KB JSON sync engine", "• Auto-sync on reconnect"],
         '#0D9488')
    ]

    bot_sprints = [
        (8.4, 1.8, "Sprint 4", "SECURITY & TIMETABLE",
         ["• Skill India Portal sync", "• Variance = |Claimed - Real|", "• SHA-256 evidence vault"],
         '#D97706'),
        (5.0, 1.8, "Sprint 5", "MSDE GIS PORTAL",
         ["• National heatmap view", "• Discrepancy triage alerts", "• Scrypt & signed JWT tokens"],
         '#2563EB'),
        (1.6, 1.8, "Sprint 6", "NATIONAL ROLLOUT",
         ["• 15,000+ national ITIs", "• Automated fraud audit", "• Direct Benefit Transfer sync"],
         '#059669')
    ]

    def render_row(sprints, is_reversed=False):
        for cx, cy, s_badge, s_title, bullets, col in sprints:
            badge = FancyBboxPatch((cx - 0.7, cy + 0.65), 1.4, 0.45,
                                   boxstyle="round,pad=0.06,rounding_size=0.22",
                                   facecolor='white', edgecolor='#64748B', linewidth=1.5, zorder=3)
            ax.add_patch(badge)
            ax.text(cx, cy + 0.88, s_badge, fontsize=8.5, fontweight='bold', color=c_dark, ha='center', va='center')

            card = FancyBboxPatch((cx - 1.4, cy - 1.2), 2.8, 1.85,
                                  boxstyle="round,pad=0.1,rounding_size=0.15",
                                  facecolor='white', edgecolor=col, linewidth=2.0, zorder=2)
            ax.add_patch(card)
            ax.text(cx, cy + 0.35, s_title, fontsize=8.8, fontweight='bold', color=col, ha='center', va='center')

            for idx, b in enumerate(bullets):
                ax.text(cx - 1.2, cy + 0.05 - idx * 0.38, b, fontsize=7.2, color=c_dark, va='center', ha='left')

    render_row(top_sprints)
    render_row(bot_sprints, is_reversed=True)

    def draw_rarrow(p1, p2):
        arr = FancyArrowPatch(p1, p2, arrowstyle='-|>', mutation_scale=16,
                              color='#64748B', linewidth=2.0, linestyle='solid')
        ax.add_patch(arr)

    draw_rarrow((3.0, 5.0), (3.6, 5.0))
    draw_rarrow((6.4, 5.0), (7.0, 5.0))

    snake = FancyArrowPatch((8.4, 3.4), (8.4, 2.8), arrowstyle='-|>', mutation_scale=16,
                            color='#64748B', linewidth=2.0, linestyle='dashed')
    ax.add_patch(snake)

    draw_rarrow((7.0, 2.0), (6.4, 2.0))
    draw_rarrow((3.6, 2.0), (3.0, 2.0))

    plt.tight_layout()
    out_path = 'presentation_assets/slide5_roadmap.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 7: SLIDE 2 - Exact Reference Style End-to-End Workflow Box
# ----------------------------------------------------------------------
def render_slide2_workflow_e2e():
    fig, ax = plt.subplots(figsize=(10.5, 5.0), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 5.0)
    ax.axis('off')

    # Outer container box
    outer = FancyBboxPatch((0.15, 0.15), 10.2, 4.7,
                           boxstyle="round,pad=0.08,rounding_size=0.15",
                           facecolor='white', edgecolor='#64748B', linewidth=1.5)
    ax.add_patch(outer)

    # Title at top center
    ax.text(5.25, 4.58, "DRISHTI-SKILLING End-to-end workflow", fontsize=11.5, fontweight='bold',
            color='#0F172A', ha='center', va='center')

    # 1. Left Pipeline Column
    # Start Pill
    p_start = FancyBboxPatch((0.6, 4.02), 1.6, 0.36, boxstyle="round,pad=0.06,rounding_size=0.18",
                             facecolor='#F472B6', edgecolor='#DB2777', linewidth=1.2)
    ax.add_patch(p_start)
    ax.text(1.4, 4.20, "Start", fontsize=8.5, fontweight='bold', color='white', ha='center', va='center')

    # Small Purple Tag Badge above CCTV
    b_cctv_tag = FancyBboxPatch((0.65, 3.48), 1.5, 0.28, boxstyle="round,pad=0.04,rounding_size=0.08",
                                facecolor='#E0E7FF', edgecolor='#6366F1', linewidth=1.0)
    ax.add_patch(b_cctv_tag)
    ax.text(1.4, 3.62, "CCTV Ingestion", fontsize=6.8, fontweight='bold', color='#4338CA', ha='center', va='center')

    # CCTV Ingest Box
    b_cctv = FancyBboxPatch((0.4, 2.45), 2.0, 0.82, boxstyle="round,pad=0.06,rounding_size=0.1",
                            facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_cctv)
    ax.text(1.4, 2.86, "Classroom CCTV / RTSP Feed\n(Shop Floor Cam Ingest)", fontsize=7.2,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Edge AI Box
    b_edge = FancyBboxPatch((0.4, 1.35), 2.0, 0.82, boxstyle="round,pad=0.06,rounding_size=0.1",
                            facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_edge)
    ax.text(1.4, 1.76, "Edge AI Processing:\nBlazeFace De-ID + YOLOv8", fontsize=7.2,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # End / Local Queue Pill (Pink, matching reference End pill)
    p_end = FancyBboxPatch((0.5, 0.42), 1.8, 0.55, boxstyle="round,pad=0.06,rounding_size=0.18",
                           facecolor='#F472B6', edgecolor='#DB2777', linewidth=1.2)
    ax.add_patch(p_end)
    ax.text(1.4, 0.695, "Local SQLite Buffer\n(72-Hr Queue / End)", fontsize=7.0,
            fontweight='bold', color='white', ha='center', va='center', linespacing=1.1)

    # 2. Center Column
    b_sidh = FancyBboxPatch((3.2, 2.75), 2.5, 0.82, boxstyle="round,pad=0.06,rounding_size=0.1",
                            facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_sidh)
    ax.text(4.45, 3.16, "Skill India Portal (SIDH)\nTimetable & Roster Match", fontsize=7.5,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Small Purple Tag Badge
    b_proc_tag = FancyBboxPatch((3.7, 2.30), 1.5, 0.26, boxstyle="round,pad=0.04,rounding_size=0.08",
                                facecolor='#E0E7FF', edgecolor='#6366F1', linewidth=1.0)
    ax.add_patch(b_proc_tag)
    ax.text(4.45, 2.43, "5-Min Telemetry Sync", fontsize=6.6, fontweight='bold', color='#4338CA', ha='center', va='center')

    b_recon = FancyBboxPatch((3.2, 1.35), 2.5, 0.82, boxstyle="round,pad=0.06,rounding_size=0.1",
                             facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_recon)
    ax.text(4.45, 1.76, "Variance Calculation:\n|Claimed - Detected| / Claimed", fontsize=7.2,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Central Blue Decision Diamond
    poly_diamond = Polygon([[6.0, 2.5], [6.9, 3.25], [7.8, 2.5], [6.9, 1.75]],
                           facecolor='#1D4ED8', edgecolor='#1E3A8A', linewidth=2.0, zorder=3)
    ax.add_patch(poly_diamond)
    ax.text(6.9, 2.5, "Discrepancy\nRate >= 15%?", fontsize=7.8, fontweight='bold', color='white',
            ha='center', va='center', zorder=4, linespacing=1.1)

    # 3. Right Column Outcomes
    # Branch "No": Green Verified
    b_green = FancyBboxPatch((8.2, 3.35), 2.0, 0.72, boxstyle="round,pad=0.06,rounding_size=0.1",
                             facecolor='#DCFCE7', edgecolor='#16A34A', linewidth=1.5)
    ax.add_patch(b_green)
    ax.text(9.2, 3.71, "Verified Compliant\n(Green Status)", fontsize=7.5,
            fontweight='bold', color='#166534', ha='center', va='center', linespacing=1.1)

    b_dbt = FancyBboxPatch((8.2, 2.35), 2.0, 0.72, boxstyle="round,pad=0.06,rounding_size=0.1",
                           facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_dbt)
    ax.text(9.2, 2.71, "Auto-Disburse DBT\nTraining Subsidy", fontsize=7.5,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Branch "Yes": Red Warning & Critical Action
    # Warning triangle
    poly_warn = Polygon([[8.0, 1.7], [8.2, 2.05], [8.4, 1.7]], facecolor='#EF4444', edgecolor='#B91C1C', lw=1.2, zorder=3)
    ax.add_patch(poly_warn)
    ax.text(8.2, 1.82, "!", fontsize=8.0, fontweight='bold', color='white', ha='center', va='center', zorder=4)

    b_red = FancyBboxPatch((8.2, 1.15), 2.0, 0.82, boxstyle="round,pad=0.06,rounding_size=0.1",
                           facecolor='#FEE2E2', edgecolor='#DC2626', linewidth=1.5)
    ax.add_patch(b_red)
    ax.text(9.2, 1.56, "Critical Red Escalation:\nFreeze Batch Subsidy", fontsize=7.5,
            fontweight='bold', color='#991B1B', ha='center', va='center', linespacing=1.1)

    b_vault = FancyBboxPatch((8.2, 0.25), 2.0, 0.68, boxstyle="round,pad=0.06,rounding_size=0.1",
                             facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_vault)
    ax.text(9.2, 0.59, "SHA-256 Vault &\nSquad GPS Triage", fontsize=7.2,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Central linking bottom dashboard update
    b_dash = FancyBboxPatch((3.2, 0.40), 2.5, 0.65, boxstyle="round,pad=0.06,rounding_size=0.1",
                            facecolor='#FEF08A', edgecolor='#CA8A04', linewidth=1.5)
    ax.add_patch(b_dash)
    ax.text(4.45, 0.725, "MSDE National GIS Portal\nLive State & Roster Update", fontsize=7.2,
            fontweight='bold', color='#0F172A', ha='center', va='center', linespacing=1.1)

    # Connecting Flow Arrows
    def draw_arr(p1, p2, txt=None, txt_pos=(0, 0)):
        arr = FancyArrowPatch(p1, p2, arrowstyle='-|>', mutation_scale=13,
                              color='#475569', linewidth=1.6, linestyle='solid')
        ax.add_patch(arr)
        if txt:
            ax.text(txt_pos[0], txt_pos[1], txt, fontsize=7.2, fontweight='bold', color='#0F172A', ha='center', va='center')

    draw_arr((1.4, 4.02), (1.4, 3.76))
    draw_arr((1.4, 3.48), (1.4, 3.27))
    draw_arr((1.4, 2.45), (1.4, 2.17))
    draw_arr((1.4, 1.35), (1.4, 0.97))

    # Connection to center calculation
    draw_arr((2.4, 1.76), (3.2, 1.76))
    draw_arr((4.45, 2.75), (4.45, 2.56))
    draw_arr((4.45, 2.30), (4.45, 2.17))
    draw_arr((5.7, 1.76), (6.1, 2.3))

    # Diamond branches
    draw_arr((7.5, 2.95), (8.2, 3.55), "No", (7.8, 3.35))
    draw_arr((9.2, 3.35), (9.2, 3.07))
    draw_arr((7.5, 2.05), (8.2, 1.6), "Yes", (7.85, 1.7))
    draw_arr((9.2, 1.15), (9.2, 0.93))

    # Bottom loop links
    draw_arr((8.2, 0.59), (5.7, 0.65))
    draw_arr((3.2, 0.725), (2.3, 0.725))

    plt.tight_layout()
    out_path = 'presentation_assets/slide2_workflow_e2e.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# ----------------------------------------------------------------------
# DIAGRAM 8: SLIDE 2 - Exact Reference Style Innovation & Uniqueness Cards
# ----------------------------------------------------------------------
def render_slide2_innovation_cards():
    import textwrap
    fig, ax = plt.subplots(figsize=(10.5, 4.4), dpi=300)
    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 4.4)
    ax.axis('off')

    # 1. Top Center Pill: Innovation and Uniqueness
    pill = FancyBboxPatch((3.8, 3.4), 2.9, 0.68, boxstyle="round,pad=0.1,rounding_size=0.34",
                          facecolor='#445E44', edgecolor='#2F432F', linewidth=2.0, zorder=3)
    ax.add_patch(pill)
    ax.text(5.25, 3.74, "Innovation\nand Uniqueness", fontsize=9.8, fontweight='bold',
            color='white', ha='center', va='center', zorder=4, linespacing=1.1)

    # 3 Decorative radiating lines above pill
    ax.plot([5.25, 5.25], [4.15, 4.30], color='#445E44', lw=2.2)
    ax.plot([4.95, 4.82], [4.12, 4.26], color='#445E44', lw=2.2)
    ax.plot([5.55, 5.68], [4.12, 4.26], color='#445E44', lw=2.2)

    # 2. Branching tree arms (connecting pill to each card)
    card_x_centers = [1.25, 3.25, 5.25, 7.25, 9.25]
    for cx in card_x_centers:
        if cx == 5.25:
            ax.plot([5.25, 5.25], [3.4, 2.9], color='#445E44', lw=2.4, zorder=2)
        else:
            rad = -0.15 if cx < 5.25 else 0.15
            if abs(cx - 5.25) > 3.0:
                rad = -0.22 if cx < 5.25 else 0.22
            arrow = FancyArrowPatch((5.25, 3.4), (cx, 2.9),
                                    arrowstyle="-", color='#445E44', lw=2.4,
                                    connectionstyle=f"arc3,rad={rad}", zorder=2)
            ax.add_patch(arrow)

    # 3. The 5 Innovation Cards
    cards_data = [
        ("50 FPS Edge\nDe-ID",
         "Volatile RAM face-blurring; zero biometric vectors stored (DPDP 2023 certified)",
         "#B45309", "#FEF3C7", 'shield'),
        ("2-5 KB\nTelemetry",
         "99.4% bandwidth saved; works on rural 2G/3G cellular dongles (<18 MB/mo)",
         "#9A3412", "#FED7AA", 'zap'),
        ("72-Hr Store\n& Forward",
         "Zero data loss during rural grid/power cuts via local transactional SQLite queue",
         "#854D0E", "#FEF08A", 'db'),
        ("Spatial Tool\nAI Audit",
         "YOLOv8 detects trade tools & workbenches; eliminates rented machine scams",
         "#C2410C", "#FFEDD5", 'gear'),
        ("National GIS\n& Vault",
         "Interactive MSDE heatmap; SHA-256 tamper-proof evidence snapshot signatures",
         "#57534E", "#E7E5E4", 'map')
    ]

    for idx, (title, desc, bg_col, bdr_col, icon_type) in enumerate(cards_data):
        cx = card_x_centers[idx]
        card_w = 1.82
        card_h = 2.7
        bx = cx - card_w / 2
        by = 0.2

        # Card body with dashed border
        card = FancyBboxPatch((bx, by), card_w, card_h, boxstyle="round,pad=0.08,rounding_size=0.15",
                              facecolor=bg_col, edgecolor=bdr_col, linewidth=1.6, linestyle='--', zorder=2)
        ax.add_patch(card)

        # Title
        ax.text(cx, by + 2.25, title, fontsize=8.6, fontweight='bold', color='white',
                ha='center', va='center', zorder=3, linespacing=1.1)

        # Subtle separator line
        ax.plot([bx + 0.2, bx + card_w - 0.2], [by + 1.82, by + 1.82], color='white', lw=0.8, alpha=0.5, zorder=3)

        # Description text wrapped cleanly
        wrapped_desc = textwrap.fill(desc, width=20)
        ax.text(cx, by + 1.25, wrapped_desc, fontsize=6.8, color='#FFFBEB',
                ha='center', va='center', zorder=3, linespacing=1.2)

        # Bottom vector icon badge (White circle, card colored symbol)
        draw_icon_badge(ax, cx, by + 0.45, icon_type, color='white', symbol_color=bg_col, radius=0.28)

    plt.tight_layout()
    out_path = 'presentation_assets/slide2_innovation_cards.png'
    plt.savefig(out_path, transparent=True, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

if __name__ == '__main__':
    render_slide2_workflow()
    render_slide2_innovations()
    render_slide2_orbital()
    render_slide3_architecture()
    render_slide4_mindmap()
    render_slide5_roadmap()
    render_slide2_workflow_e2e()
    render_slide2_innovation_cards()
    print("All vector diagram assets generated cleanly!")
