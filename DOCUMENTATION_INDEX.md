# HON Orders Assessment — Complete Documentation Index

## Overview

This folder contains a **comprehensive 90-minute .NET practical assessment** for evaluating hands-on competency in:

- **C#** & modern language features
- **LINQ** queries and algorithms
- **SQL Server** and Entity Framework Core
- **ASP.NET Core MVC** with server-side rendering
- **Unit testing** with xUnit

---

## 📋 Documentation Files

### For Candidates

#### 1. **QUICK_START_GUIDE.md** ⭐ START HERE
- **Purpose:** Get up and running in the first 5 minutes
- **Contains:**
  - Step-by-step solution creation commands
  - Project dependency setup
  - Folder structure checklist
  - Code skeleton snippets
  - Common pitfalls to avoid
- **When to use:** Before writing any code

#### 2. **ASSESSMENT_SPECIFICATION.md** 📖 MAIN REQUIREMENTS
- **Purpose:** Complete specification of all tasks and requirements
- **Contains:**
  - Solution structure details
  - Complete domain model specification (6 entities)
  - All 14 assessment tasks organized by section
  - Acceptance criteria for each task
  - Time allocation (90 minutes)
  - FAQ section
  - Full grading rubric
- **When to use:** Reference throughout development

#### 3. **CANDIDATE_CHECKLIST.md** ✅ TRACK PROGRESS
- **Purpose:** Monitor progress and ensure nothing is missed
- **Contains:**
  - Checkbox for each requirement
  - Time management guidance
  - Quick wins prioritization
  - Last-minute verification checklist
  - Resources reference
- **When to use:** Use to track completion; refer to before submission

#### 4. **SOLUTION_TEMPLATE.md** 🏗️ IMPLEMENTATION GUIDE
- **Purpose:** Show expected code structure and implementation patterns
- **Contains:**
  - Complete project folder structure
  - Entity implementations with full code
  - DbContext configuration example
  - Service layer code samples
  - Filter implementations
  - Tag helper examples
  - Complete unit test examples
  - README template
- **When to use:** Reference for implementation patterns and expected structure

---

### For Assessors & Instructors

#### 1. **GRADING_GUIDE.md** 🎯 EVALUATION REFERENCE
- **Purpose:** Detailed grading criteria and scoring guidelines
- **Contains:**
  - Point allocation per task (100 points total)
  - Detailed acceptance criteria checklists
  - Scoring guides with partial credit rules
  - Common issues and scoring adjustments
  - Test quality evaluation
  - Code quality assessment
  - Grading scale (A–F)
  - Evaluation form template
  - Quick evaluation checklist
- **When to use:** During grading/assessment

#### 2. **ASSESSMENT_SPECIFICATION.md** 📖 OFFICIAL SPEC
- **Purpose:** Official assessment definition shared with candidates
- **Contains:** Same as above (for consistency)
- **When to use:** Reference for official requirements and grading rubric

---

## 🎯 Quick Reference by Role

### **For Candidates**

**Start:**
1. Read QUICK_START_GUIDE.md
2. Review ASSESSMENT_SPECIFICATION.md (sections 1–4)
3. Run commands from QUICK_START_GUIDE.md

**Develop:**
1. Follow implementation order in QUICK_START_GUIDE.md
2. Reference SOLUTION_TEMPLATE.md for code patterns
3. Use CANDIDATE_CHECKLIST.md to track progress
4. Refer back to ASSESSMENT_SPECIFICATION.md for details

**Submit:**
1. Verify all items in CANDIDATE_CHECKLIST.md completed
2. Ensure build succeeds and tests pass
3. Create README.md (template in SOLUTION_TEMPLATE.md)
4. Zip solution and submit

---

### **For Assessors**

**Before Assessment:**
1. Review ASSESSMENT_SPECIFICATION.md (full requirements)
2. Study SOLUTION_TEMPLATE.md (expected structure)
3. Review GRADING_GUIDE.md (scoring criteria)

**During Grading:**
1. Use GRADING_GUIDE.md point allocation
2. Reference acceptance criteria checklists
3. Verify code structure matches SOLUTION_TEMPLATE.md
4. Use evaluation form template

**Final Scoring:**
1. Calculate total points using GRADING_GUIDE.md rubric
2. Provide feedback based on accepted vs. missing criteria
3. Document recommendations (pass/borderline/fail)

---

## 📊 Assessment Structure

### **Time Allocation**

| Section | Time | Points |
|---------|------|--------|
| C# & LINQ | 25 min | 20 pts |
| Entity Framework Core | 20 min | 20 pts |
| ASP.NET Core MVC | 35 min | 40 pts |
| Testing with xUnit | 10 min | 10 pts |
| Code Quality & Submission | — | 10 pts |
| **TOTAL** | **90 min** | **100 pts** |

### **Grading Scale**

| Score | Grade | Interpretation |
|-------|-------|-----------------|
| 90–100 | A | Excellent (all requirements met) |
| 80–89 | B | Good (most requirements met) |
| 70–79 | C | Satisfactory (core requirements met) |
| 60–69 | D | Passing (basic functionality) |
| <60 | F | Failing (incomplete/non-functional) |

---

## 🚀 Key Features of This Assessment

### **What Candidates Will Build**

A mini **order-management ASP.NET Core MVC web application** with:

- ✅ Responsive UI (Bootstrap 5)
- ✅ Product catalog browsing
- ✅ Order creation with dynamic line items
- ✅ Admin area for product management (CRUD)
- ✅ Soft delete implementation
- ✅ Concurrency control (RowVersion)
- ✅ Custom filters and tag helpers
- ✅ Comprehensive unit tests

### **Technologies Covered**

- **C#:** Value objects, operators, immutability, LINQ, async/await, expression trees
- **LINQ:** GroupBy, SelectMany, Join, OrderBy, date filtering
- **SQL Server:** Via Entity Framework Core
- **EF Core:** Fluent API, migrations, relationships, concurrency tokens, query filters
- **ASP.NET Core MVC:** Controllers, views, model binding, validation, areas, filters, tag helpers
- **Testing:** xUnit, AAA pattern, in-memory databases

---

## 📝 Document Purposes (Detailed)

### **QUICK_START_GUIDE.md**
- Gets candidates from zero to working project in 5 minutes
- Provides command-line instructions
- Includes code skeletons for common patterns
- Lists time-saving tips

### **ASSESSMENT_SPECIFICATION.md**
- Official definition of all requirements
- Detailed task descriptions with acceptance criteria
- Scenario context ("HON Orders" business case)
- Domain model specification
- Time allocations per task
- FAQ addressing common questions
- Complete grading rubric

### **CANDIDATE_CHECKLIST.md**
- Breakdown of every requirement into checkboxes
- Organized by section with time estimates
- Quick wins section for time management
- Last-minute verification items
- Ensures nothing is forgotten

### **SOLUTION_TEMPLATE.md**
- Expected project structure and organization
- Complete code examples for each major task
- Entity implementations (all 6 entities)
- DbContext configuration
- Service layer patterns
- Filter implementations
- Tag helper examples
- Test examples with complete code
- README template with setup instructions

### **GRADING_GUIDE.md**
- Point allocation per task (100 total)
- Detailed acceptance criteria per task
- Partial credit guidance
- Common issues and scoring adjustments
- Test quality evaluation criteria
- Code quality assessment
- Sample evaluation form
- Quick evaluation checklist for rapid grading

---

## 💡 Implementation Tips

### **For Candidates**

1. **Read requirements fully** before coding (10 min read time)
2. **Create all projects first** (5 min setup)
3. **Build incrementally** — complete one section before moving to next
4. **Test frequently** — don't wait until the end
5. **Prioritize** — focus on core functionality first (CRUD, basic LINQ)
6. **Use the template** — reference code samples when stuck
7. **Save time** — skip nice-to-have features if running short

### **For Assessors**

1. **Familiarize** yourself with SOLUTION_TEMPLATE.md first
2. **Grade consistently** using GRADING_GUIDE.md
3. **Give partial credit** — incomplete features should score points
4. **Document issues** — note which acceptance criteria weren't met
5. **Provide feedback** — help candidates understand what was missing
6. **Consider context** — 90 minutes is tight; incomplete != incapable

---

## ❓ FAQ

### **Can candidates see all the documentation?**
Yes! Provide all documents except GRADING_GUIDE.md (internal use). Candidates see:
- QUICK_START_GUIDE.md
- ASSESSMENT_SPECIFICATION.md
- CANDIDATE_CHECKLIST.md
- SOLUTION_TEMPLATE.md

### **What if a candidate runs out of time?**
Partial credit is available. Prioritize:
1. Money VO + LINQ queries (10 pts easy)
2. DbContext + migrations (10 pts)
3. Admin CRUD (15–20 pts)
4. Tests (5–10 pts)

### **Can candidates use libraries like AutoMapper?**
Yes, but core logic must be hand-written. Money VO, LINQ, filters, etc. must be custom.

### **Is authentication required?**
Not required, but useful for Admin role check. Provide mock if not implementing full auth.

### **What's a passing score?**
60+ points is passing. 90+ is excellent. Encourage quality over quantity.

---

## 📚 Assessment Philosophy

This assessment evaluates **practical, hands-on competency** in modern .NET development:

✅ **Balanced coverage** across C#, LINQ, EF Core, MVC, and testing  
✅ **Real-world scenarios** (order management, soft delete, concurrency)  
✅ **Incremental complexity** from basic LINQ to advanced expression trees  
✅ **Quality over speed** — clean code and proper testing valued  
✅ **Partial credit** — incomplete features still earn points  
✅ **Clear expectations** — acceptance criteria guide implementation  

---

## 📂 File Summary

| File | Audience | Purpose | Length |
|------|----------|---------|--------|
| QUICK_START_GUIDE.md | Candidates | Get started fast | 5 pages |
| ASSESSMENT_SPECIFICATION.md | Candidates/Assessors | Official requirements | 15+ pages |
| CANDIDATE_CHECKLIST.md | Candidates | Track progress | 8 pages |
| SOLUTION_TEMPLATE.md | Candidates/Assessors | Expected structure & code | 10+ pages |
| GRADING_GUIDE.md | Assessors | Detailed grading criteria | 12+ pages |
| DOCUMENTATION_INDEX.md | Everyone | This file | — |

---

## ✨ Getting Started

### **For Candidates:**
1. Read this index (this file)
2. Open QUICK_START_GUIDE.md
3. Follow the "Getting Started" section
4. Begin creating your solution

### **For Assessors:**
1. Read this index (this file)
2. Review SOLUTION_TEMPLATE.md to understand expected implementation
3. Study GRADING_GUIDE.md for evaluation criteria
4. Keep ASSESSMENT_SPECIFICATION.md handy during grading

---

## 🎓 Learning Outcomes

After completing this assessment, candidates will have demonstrated:

- ✅ Fluency with C# language features (value objects, operators, async/await)
- ✅ LINQ proficiency (complex queries, grouping, filtering)
- ✅ EF Core mastery (configuration, migrations, concurrency, soft delete)
- ✅ ASP.NET Core MVC expertise (controllers, views, filters, validation)
- ✅ Testing discipline (AAA pattern, in-memory databases, xUnit)
- ✅ Clean code practices (organization, naming, documentation)
- ✅ Real-world problem-solving (order management system)

---

## 📞 Support

**If a candidate has questions:**
- Check ASSESSMENT_SPECIFICATION.md FAQ section first
- Clarify requirements only; don't give away solutions
- Point to code examples in SOLUTION_TEMPLATE.md

**If an assessor has questions:**
- Review GRADING_GUIDE.md for specific criteria
- Reference SOLUTION_TEMPLATE.md for expected structure
- Document edge cases for future assessments

---

## 🎯 Final Thoughts

This assessment is designed to be:

- **Comprehensive** — covers all major .NET competencies
- **Fair** — clear criteria, partial credit available
- **Practical** — real-world scenario, not abstract theory
- **Time-aware** — 90 minutes is tight but achievable
- **Supportive** — clear documentation helps candidates succeed

Good luck to all candidates! 🚀

---

**Assessment Suite Version:** 1.0  
**Last Updated:** 2026-06-23  
**Target Audience:** ASP.NET Core MVC Developers (Intermediate)  
**Duration:** 90 minutes  
**Total Points:** 100
