using DataAccess.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UserRegistration.Test.Helpers
{
    public static class DbContextHelper
    {
        public static UserDetailDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<UserDetailDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // unique DB per test
                .Options;

            return new UserDetailDbContext(options); 
        }
    }
}
