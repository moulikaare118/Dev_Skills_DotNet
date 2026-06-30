using HON.Academy.DAL.DataTransferObject;
using HON.Academy.DAL.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HON.Academy.DAL.Services
{
    public interface ICourseService
    {
        Task<List<StudentPerformanceDTO>> GetTopStudentsAsync();

        Task<List<Course>> SearchCoursesAsync(
            decimal? minFee,
            decimal? maxFee,
            int? duration,
            string specialization,
            string keyword);


    }
}
