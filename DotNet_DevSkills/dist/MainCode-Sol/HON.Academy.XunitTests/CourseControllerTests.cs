using HON.Academy.DAL.Model;
using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace HON.Academy.XunitTests
{
    public class CourseControllerTests
    {
        [Fact]
        public async Task TopStudents_ReturnsViewWithModel()
        {
            var fakeService = new FakeCourseService
            {
                TopStudentsToReturn = new List<StudentPerformanceDTO>
                {
                    new StudentPerformanceDTO { StudentName = "Alice", CourseTitle = "Math", AverageScore = 97.5 }
                }
            };

            var controller = new CourseController(fakeService);

            var result = await controller.TopStudents();

            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsAssignableFrom<List<StudentPerformanceDTO>>(viewResult.Model);
            Assert.Single(model);
            Assert.Equal("Alice", model[0].StudentName);
        }

        [Fact]
        public void SearchGet_ReturnsViewWithEmptyCourseDto()
        {
            var controller = new CourseController(new FakeCourseService());

            var result = controller.Search();

            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<CourseDTO>(viewResult.Model);
            Assert.Empty(model.Results);
            Assert.Null(model.MinFee);
            Assert.Null(model.MaxFee);
            Assert.Null(model.Duration);
        }

        [Fact]
        public async Task SearchPost_PopulatesResultsAndReturnsView()
        {
            var fakeService = new FakeCourseService
            {
                SearchResultsToReturn = new List<Course>
                {
                    new Course { Id = 1, Title = "ASP.NET Core", Code = "NET01", Fee = 500m, DurationWeeks = 6 }
                }
            };

            var vm = new CourseDTO
            {
                MinFee = 100m,
                MaxFee = 1000m,
                Duration = 6,
                Specialization = "Dot Net",
                TitleKeyword = "ASP.NET"
            };

            var controller = new CourseController(fakeService);

            var result = await controller.Search(vm);

            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<CourseDTO>(viewResult.Model);
            Assert.Equal(vm, model);
            Assert.Single(model.Results);
            Assert.Equal("NET01", model.Results[0].Code);
            Assert.Equal(100m, fakeService.CapturedMinFee);
            Assert.Equal(1000m, fakeService.CapturedMaxFee);
            Assert.Equal(6, fakeService.CapturedDuration);
            Assert.Equal("Dot Net", fakeService.CapturedSpecialization);
            Assert.Equal("ASP.NET", fakeService.CapturedKeyword);
        }

        private class FakeCourseService : ICourseService
        {
            public List<StudentPerformanceDTO> TopStudentsToReturn { get; set; } = new List<StudentPerformanceDTO>();
            public List<Course> SearchResultsToReturn { get; set; } = new List<Course>();

            public decimal? CapturedMinFee { get; private set; }
            public decimal? CapturedMaxFee { get; private set; }
            public int? CapturedDuration { get; private set; }
            public string CapturedSpecialization { get; private set; }
            public string CapturedKeyword { get; private set; }

            public Task<List<StudentPerformanceDTO>> GetTopStudentsAsync()
            {
                return Task.FromResult(TopStudentsToReturn);
            }

            public Task<List<Course>> SearchCoursesAsync(decimal? minFee, decimal? maxFee, int? duration, string specialization, string keyword)
            {
                CapturedMinFee = minFee;
                CapturedMaxFee = maxFee;
                CapturedDuration = duration;
                CapturedSpecialization = specialization;
                CapturedKeyword = keyword;
                return Task.FromResult(SearchResultsToReturn);
            }
        }
    }
}
