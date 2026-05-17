from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "Chapter8_A24CS4045_ZUO_BOYU_Report.docx"
SCREENSHOT = ROOT / "docs" / "ui-screenshot.png"


def set_font(run, size=None, bold=False, color=None):
    run.font.name = "Calibri"
    if size:
        run.font.size = Pt(size)
    run.bold = bold
    if color:
        run.font.color.rgb = RGBColor(*color)


def set_paragraph(paragraph, before=0, after=6, line_spacing=1.1):
    fmt = paragraph.paragraph_format
    fmt.space_before = Pt(before)
    fmt.space_after = Pt(after)
    fmt.line_spacing = line_spacing


def add_heading(doc, text, level=1):
    paragraph = doc.add_paragraph()
    set_paragraph(paragraph, before=10 if level == 1 else 6, after=4)
    run = paragraph.add_run(text)
    set_font(run, size=16 if level == 1 else 13, bold=True, color=(46, 116, 181))
    return paragraph


def add_body(doc, text, bold_label=None):
    paragraph = doc.add_paragraph()
    set_paragraph(paragraph)
    if bold_label:
        label = paragraph.add_run(bold_label)
        set_font(label, size=10.5, bold=True)
    run = paragraph.add_run(text)
    set_font(run, size=10.5)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    set_paragraph(paragraph, after=3)
    run = paragraph.add_run(text)
    set_font(run, size=10.3)
    return paragraph


def shade_cell(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn

    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def style_table(table):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    for row_index, row in enumerate(table.rows):
        for cell in row.cells:
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            for paragraph in cell.paragraphs:
                set_paragraph(paragraph, after=0)
                for run in paragraph.runs:
                    set_font(run, size=9.2, bold=row_index == 0)
            if row_index == 0:
                shade_cell(cell, "F2F4F7")


doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.8)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(0.8)
section.right_margin = Inches(0.8)

styles = doc.styles
styles["Normal"].font.name = "Calibri"
styles["Normal"].font.size = Pt(10.5)

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph(title, after=2)
run = title.add_run("Chapter 8 Individual Assignment Report")
set_font(run, size=20, bold=True, color=(15, 23, 42))

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_paragraph(subtitle, after=10)
run = subtitle.add_run("Employee Directory with Vue 3, Axios, Express and MySQL")
set_font(run, size=11, color=(85, 95, 110))

meta = doc.add_table(rows=2, cols=4)
meta.columns[0].width = Inches(1.2)
meta.columns[1].width = Inches(2.1)
meta.columns[2].width = Inches(1.2)
meta.columns[3].width = Inches(2.0)
meta.cell(0, 0).text = "Name"
meta.cell(0, 1).text = "ZUO BOYU"
meta.cell(0, 2).text = "Matric No."
meta.cell(0, 3).text = "A24CS4045"
meta.cell(1, 0).text = "Course"
meta.cell(1, 1).text = "Cross Platform Application Development"
meta.cell(1, 2).text = "Project"
meta.cell(1, 3).text = "Employee Directory"
style_table(meta)

add_heading(doc, "1. Working User Interface", 1)
add_body(
    doc,
    "The Employee Directory is a single-page HR admin interface with summary cards, an add/edit form, search and sort controls, paginated employee records, and visible active/inactive status badges."
)
if SCREENSHOT.exists():
    picture_paragraph = doc.add_paragraph()
    picture_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    picture_paragraph.add_run().add_picture(str(SCREENSHOT), width=Inches(6.45))
    caption = doc.add_paragraph()
    caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_paragraph(caption, after=2)
    run = caption.add_run("Figure 1. Employee Directory frontend with 21 seeded employees and pagination.")
    set_font(run, size=8.8, color=(85, 95, 110))

doc.add_page_break()

add_heading(doc, "2. How the Project Meets the Brief", 1)
table = doc.add_table(rows=1, cols=3)
table.columns[0].width = Inches(1.25)
table.columns[1].width = Inches(2.55)
table.columns[2].width = Inches(2.35)
hdr = table.rows[0].cells
hdr[0].text = "Area"
hdr[1].text = "Brief Requirement"
hdr[2].text = "Implementation"
rows = [
    ("Frontend", "Vue 3 Composition API with Vite.", "Uses .vue components, <script setup>, parent-held state, props, and emits."),
    ("Axios", "Single Axios instance with interceptors.", "src/services/api.js defines baseURL, timeout, headers, request logging, and mapped error messages."),
    ("Backend", "Express API with /employees CRUD.", "server/index.cjs implements GET, POST, PUT, DELETE, search, sort, and pagination."),
    ("Database", "MySQL with mysql2 promise pool and prepared statements.", "server/db.cjs uses mysql2/promise; SQL values use ? placeholders."),
    ("Seed data", "At least 7 employees across 3 departments with inactive staff.", "schema.sql now inserts 21 employees across five departments, including inactive records."),
    ("UX", "Loading, error, active/inactive display, RM formatting, responsive layout.", "EmployeeList shows loading/empty states, badges, MYR currency, and page controls."),
]
for values in rows:
    cells = table.add_row().cells
    for index, value in enumerate(values):
        cells[index].text = value
style_table(table)

add_heading(doc, "3. Learning Outcomes", 1)
add_bullet(doc, "LO1: Vue connects to an external REST API and refreshes employee data from the Express backend.")
add_bullet(doc, "LO2: Axios is configured as a reusable service module with central request and response handling.")
add_bullet(doc, "LO3: The form uses v-model modifiers, custom validation rules, and inline messages before submission.")
add_bullet(doc, "LO4: MySQL persistence is handled through prepared statements with CRUD, server-side search, sort, and pagination.")

doc.add_page_break()

add_heading(doc, "4. Main Features", 1)
add_bullet(doc, "Create, read, update, and delete employee records through /employees.")
add_bullet(doc, "Search by name, employee ID, email, or department using SQL LIKE.")
add_bullet(doc, "Sort by whitelisted fields: name, hire date, salary, and department.")
add_bullet(doc, "Switch pages with 7 employees per page across 21 seed records.")
add_bullet(doc, "Show total, active, and inactive headcount in summary cards.")

add_heading(doc, "5. Challenges and Resolutions", 1)
add_body(doc, "", "Database connection: ")
add_bullet(doc, "The API was updated to use 127.0.0.1 by default to avoid localhost IPv6 connection issues on Windows/Laragon.")
add_body(doc, "", "Safe sorting: ")
add_bullet(doc, "The server maps requested sort fields to a whitelist before building the ORDER BY clause.")
add_body(doc, "", "Responsive layout: ")
add_bullet(doc, "The UI was adjusted to remove sidebar crowding, keep the Actions column visible, and stack the form above the table on tablet widths.")

add_heading(doc, "6. Setup Summary", 1)
add_bullet(doc, "Import sql/schema.sql into Laragon MySQL.")
add_bullet(doc, "Run npm install in the employee-directory folder.")
add_bullet(doc, "Start the app with npm run dev or .\\start-app.ps1.")
add_bullet(doc, "Open http://127.0.0.1:5174 for the Vue frontend; the API runs on http://127.0.0.1:3001.")

doc.save(OUT)
print(OUT)
