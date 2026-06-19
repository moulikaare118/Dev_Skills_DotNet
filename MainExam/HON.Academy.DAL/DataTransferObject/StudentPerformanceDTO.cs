using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HON.Academy.DAL.DataTransferObject
{
    public class StudentPerformanceDTO
        {
            public string StudentName { get; set; } = string.Empty;
            public string CourseTitle { get; set; } = string.Empty;
            public double AverageScore { get; set; }
        }
}



