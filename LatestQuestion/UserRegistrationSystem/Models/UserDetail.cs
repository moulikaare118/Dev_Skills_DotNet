using System.ComponentModel.DataAnnotations;

namespace UserRegistrationSystem.Models
{
    public class UserDetail
    {

        //Add Data Annotations for Validation
        public int Id { get; set; }

        //Add Data Annotations for Validation
        [Required]
        [StringLength(35)]
        public string FirstName { get; set; }

        //Add Data Annotations for Validation
        [Required]
        [StringLength(35)]
        public string LastName { get; set; }

        //Add Data Annotations for Validation
        [Required]
        [EmailAddress]
        public string EmailId { get; set; }

        //Add Data Annotations for Validation
        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        //Add Data Annotations for Validation
        public bool IsActive { get; set; } = true;
    }

}
