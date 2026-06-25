using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Services;
using Microsoft.AspNetCore.Mvc;


public class CourseController : Controller
{
    private readonly ICourseService _service;
    //TODO:Task 3.1
    public CourseController(ICourseService service)
    {
        // TODO:
        // 1. Use constructor injection to receive the service instance
        // 2. Assign injected service to the private readonly field
        // 3. This enables controller to call business logic without creating objects manually
        // 4. Follow Dependency Injection best practices
        throw new NotImplementedException();
    }
    //TODO:Task 3.2
    [HttpGet]
    public async Task<IActionResult> TopStudents()
    {
        // TODO:
        // 1. Call service to get top students (returns List<StudentPerformanceDTO>)
        // 2. Do NOT access DbContext directly in controller
        // 3. Pass DTO list to View
        // 4. Return View with DTO model
       throw new NotImplementedException();
    }
    //TODO:Task 3.3
    [HttpGet]
    public IActionResult Search()
    {
        // TODO:
        // 1. Create empty CourseDTO view model
        // 2. This DTO will hold filter inputs and result collection
        // 3. Pass DTO to View
        // 4. Return Search page
        throw new NotImplementedException();
    }
    [HttpPost]

    public async Task<IActionResult> Search(CourseDTO vm)
    {
        // TODO:
        // 1. Call service SearchCoursesAsync using values from CourseDTO
        // 2. Store returned Course entity list inside vm.Results collection
        // 3. Do NOT return raw entity list directly to View
        // 4. Return View with updated CourseDTO

        throw new NotImplementedException();
    }
}