using DataAccess.Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DataAccess.Validation
{
    public class ValidSkuAttribute : ValidationAttribute
    {
        //Task – Custom Validation Attribute
        protected override ValidationResult IsValid(object value, ValidationContext context)
        {
            // TODO:
            // - Validate that the SKU follows a strict format:
            //      • Exactly 1 uppercase letter (A–Z)
            //      • Followed by exactly 3 digits (0–9)
            // - Example of valid SKU: A123
            // - Example of invalid SKU: a123, AB12, 1234, A12, null, empty
            // - If invalid, return a ValidationResult with message:
            //      "SKU must be in format A123"
            // - If valid, return ValidationResult.Success
            // - Do NOT throw exceptions.
            // - Use Regex for validation.

            var sku = value as string;
            if (string.IsNullOrWhiteSpace(sku))
                return new ValidationResult("SKU must be in format A123");

            var regex = new Regex("^[A-Z][0-9]{3}$");
            if (!regex.IsMatch(sku))
                return new ValidationResult("SKU must be in format A123");

            return ValidationResult.Success!;
        }
    }
}
