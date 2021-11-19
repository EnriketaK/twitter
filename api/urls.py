from django.urls import path

from . import views

urlpatterns = [
	path('', views.apiOverview, name="api-overview"),
	path('post-list/', views.PostList.as_view(), name="post-list"),
	path('post-list/<str:username>', views.PostListUser.as_view(), name="post-list-user"),
	path('post-list-following/', views.PostListFollowing.as_view(), name="post-list-following"),
	path('post-detail/<int:pk>/', views.postDetail, name="post-detail"),
	path('post-create/', views.PostCreate.as_view(), name="post-create"),
	path('post-update/<int:pk>/', views.PostUpdate.as_view(), name="post-update"),
	path('post-delete/<int:pk>/', views.postDelete, name="post-delete"),
	path('last-post/<str:username>/', views.lastPost, name="last-post"),
	path('follow-state/<str:follower>/<str:followed>', views.followState, name="follow-state"), #ska slash / ne fund
	path('like-state/<str:liker>/<int:liked>/', views.likeState, name="like-state"),

]