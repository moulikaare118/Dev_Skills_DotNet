using EventManagment.DAL.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Diagnostics;
using UserRegistrationSystem.Models;

namespace UserRegistrationSystem.Controllers
{
    public class UserDetailController : Controller
    {
        private IRepository _repository;
        public UserDetailController(IRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public IActionResult Index()
        {
            // Important and Mandatory:
            // Always map repository data into MVC model objects before passing to the view.
            // This is required because automated checks will validate your code logic.
            // If you skip mapping, your solution will not be accepted.
          
            //TODO: fetch the list of users from repository
            var users = _repository.GetUsersList();
            //TODO: pass the list to the view
            return View(users);
        }
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Create(UserRegistrationSystem.Models.UserDetail userDetail)
        {
            // TODO: Add logic here to save the userDetail record
            if (!ModelState.IsValid)
            {
                return View(userDetail);
            }

            var dalUser = new EventManagment.DAL.Model.UserDetail
            {
                FirstName = userDetail.FirstName,
                LastName = userDetail.LastName,
                EmailId = userDetail.EmailId,
                Password = userDetail.Password,
                IsActive = userDetail.IsActive
            };

            // TODO: If the user is added successfully, redirect the user to the Index page
            if (_repository.AddUser(dalUser))
            {
                return RedirectToAction("Index");
            }

            return View(userDetail);
        }
        [HttpGet]   
        public IActionResult Edit(int id)
        {
            //TODO: fetch the user detail from repository based on id
            var user = _repository.GetUser(id);
            if (user == null)
            {
                return View();
            }

            //TODO: map the DAL user detail to MVC user detail
            var model = new UserRegistrationSystem.Models.UserDetail
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmailId = user.EmailId,
                Password = user.Password,
                IsActive = user.IsActive
            };

            //TODO : pass the user detail to the view
            return View(model);
        }
        [HttpPost]
        public IActionResult Edit(UserRegistrationSystem.Models.UserDetail userDetail)
        {

            //TODO: validate the model
            if (!ModelState.IsValid)
            {
                return View(userDetail);
            }

            var existingUser = _repository.GetUser(userDetail.Id);
            if (existingUser == null)
            {
                //TODO: update the user details 
                return View(userDetail);
            }

            var dalUser = new EventManagment.DAL.Model.UserDetail
            {
                Id = userDetail.Id,
                FirstName = userDetail.FirstName,
                LastName = userDetail.LastName,
                EmailId = userDetail.EmailId,
                Password = userDetail.Password,
                IsActive = userDetail.IsActive
            };

            //TODO: redirect to index page on success
            if (_repository.EditUser(dalUser))
            {
                return RedirectToAction("Index");
            }

            return View(userDetail);
        }

    }
}
