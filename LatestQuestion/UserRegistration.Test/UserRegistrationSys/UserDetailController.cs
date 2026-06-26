using EventManagment.DAL.Repository;
using Microsoft.AspNetCore.Mvc;
using Moq;
using UserRegistrationSystem.Controllers;
using UserRegistrationSystem.Models;
using UserRegistration;
using Xunit;

namespace UserRegistration.Test.UserRegistrationSys
{
    public class UserDetailController
    {

        [Fact]
        public void Index_ReturnsViewWithUserList()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            var users = new List<EventManagment.DAL.Model.UserDetail>
            {
                new EventManagment.DAL.Model.UserDetail { Id = 1, FirstName = "Alice", LastName = "Smith", EmailId = "alice@example.com", Password = "pass", IsActive = true },
                new EventManagment.DAL.Model.UserDetail { Id = 2, FirstName = "Bob", LastName = "Jones", EmailId = "bob@example.com", Password = "pass", IsActive = true }
            };
            mockRepo.Setup(r => r.GetUsersList()).Returns(users);
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);

            // Act
            var result = controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.Equal(users, viewResult.Model);
        }

        [Fact]
        public void Index_RepositoryReturnsNull_ReturnsViewWithNullModel()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            mockRepo.Setup(r => r.GetUsersList()).Returns((List<EventManagment.DAL.Model.UserDetail>)null);
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);

            // Act
            var result = controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.Null(viewResult.Model);
        }
        [Fact]
        public void Create_Post_ValidModel_RedirectsToIndex()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            mockRepo.Setup(r => r.AddUser(It.IsAny<EventManagment.DAL.Model.UserDetail>())).Returns(true);
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);
            var userDetail = new UserDetail
            {
                FirstName = "John",
                LastName = "Doe",
                EmailId = "john@example.com",
                Password = "Password123"
            };
            controller.ModelState.Clear(); // Valid model

            // Act
            var result = controller.Create(userDetail);

            // Assert
            var redirect = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Index", redirect.ActionName);
        }

        [Fact]
        public void Create_Post_InvalidModel_ReturnsView()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);
            controller.ModelState.AddModelError("FirstName", "Required");
            var userDetail = new UserDetail();

            // Act
            var result = controller.Create(userDetail);

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public void Edit_Post_ValidModel_UserExists_RedirectsToIndex()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            mockRepo.Setup(r => r.GetUser(It.IsAny<int>())).Returns(new EventManagment.DAL.Model.UserDetail());
            mockRepo.Setup(r => r.EditUser(It.IsAny<EventManagment.DAL.Model.UserDetail>())).Returns(true);
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);
            var userDetail = new UserDetail
            {
                Id = 1,
                FirstName = "Jane",
                LastName = "Smith",
                EmailId = "jane@example.com",
                Password = "Password123"
            };
            controller.ModelState.Clear();

            // Act
            var result = controller.Edit(userDetail);

            // Assert
            var redirect = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Index", redirect.ActionName);
        }

        [Fact]
        public void Edit_Post_InvalidModel_ReturnsViewWithModel()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);
            controller.ModelState.AddModelError("EmailId", "Required");
            var userDetail = new UserDetail();

            // Act
            var result = controller.Edit(userDetail);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.Equal(userDetail, viewResult.Model);
        }

        [Fact]
        public void Edit_Post_ValidModel_UserDoesNotExist_ReturnsView()
        {
            // Arrange
            var mockRepo = new Mock<IRepository>();
            mockRepo.Setup(r => r.GetUser(It.IsAny<int>())).Returns((EventManagment.DAL.Model.UserDetail)null);
            var controller = new UserRegistrationSystem.Controllers.UserDetailController(mockRepo.Object);
            var userDetail = new UserDetail
            {
                Id = 99,
                FirstName = "Ghost",
                LastName = "User",
                EmailId = "ghost@example.com",
                Password = "Password123"
            };
            controller.ModelState.Clear();

            // Act
            var result = controller.Edit(userDetail);

            // Assert
            Assert.IsType<ViewResult>(result);
        }
    }
}