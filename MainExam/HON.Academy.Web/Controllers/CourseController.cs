using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Services;
using Microsoft.AspNetCore.Mvc;

namespace HON.Academy.Web.Controllers
{
    public class CourseController : Controller
    {
        private readonly ICourseService _service;

        // Implements Task 3.1: Controller constructor DI
        // Description: Receives ICourseService via constructor injection and assigns to private field.
        public CourseController(ICourseService service)
        {
            _service = service;
        }

        // Implements Task 3.2: TopStudents action
        // Description: Calls service to get top students (StudentPerformanceDTO list) and returns View.
        [HttpGet]
        public async Task<IActionResult> TopStudents()
        {
            var topStudents = await _service.GetTopStudentsAsync();
            return View(topStudents);
        }

        // Implements Task 3.3: Course Search (GET)
        // Description: Returns an empty CourseDTO view model for filter inputs.
        [HttpGet]
        public IActionResult Search()
        {
            var vm = new CourseDTO();
            return View(vm);
        }

        // Implements Task 3.3: Course Search (POST)
        // Description: Calls SearchCoursesAsync with values from CourseDTO, stores results in vm.Results and returns View.
        [HttpPost]
        public async Task<IActionResult> Search(CourseDTO vm)
        {
            var results = await _service.SearchCoursesAsync(vm.MinFee, vm.MaxFee, vm.Duration, vm.Specialization, vm.TitleKeyword);
            vm.Results = results;
            return View(vm);
        }
    }
}
