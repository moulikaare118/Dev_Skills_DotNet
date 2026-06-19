using HON.Academy.DAL.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HON.Academy.DAL.DataTransferObject
{
    public class CourseDTO
    {
        public decimal? MinFee { get; set; }
        public decimal? MaxFee { get; set; }
        public int? Duration { get; set; }
        public string Specialization { get; set; } = string.Empty;
        public string TitleKeyword { get; set; } = string.Empty;

        public List<Course> Results { get; set; } = new List<Course>();

    }
}
