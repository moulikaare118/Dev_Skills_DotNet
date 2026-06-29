using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security.Principal;

namespace EventManagment.DAL.Model
{
    public class UserDetail
    {
        //Check the Data folder in which the database context class is added
        //Add the required constraints e.g. Key,StringLength(35) etc

        [Key]
        public int Id { get; set; }
     
        [Required]
        [StringLength(35)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(35)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string EmailId { get; set; }

        [Required]
        public string Password { get; set; }
       
        public bool IsActive { get; set; }
    }

}
