using EventManagment.DAL.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccess.Data
{
    public class UserDetailDbContext:DbContext
    {
        public DbSet<UserDetail> UserDetails { get; set; }
        public UserDetailDbContext(){}

        public UserDetailDbContext(DbContextOptions<UserDetailDbContext> option) : base(option) { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Provide connection string
                optionsBuilder.UseSqlite("provide your database name here");
            }
        }
     


    }
}
