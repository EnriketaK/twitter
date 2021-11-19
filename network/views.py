from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.core import serializers
from django.urls import reverse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import (
    ListView,
    DetailView,
    CreateView,
    UpdateView,
    DeleteView
)
from api.models import *
from .forms import *
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import json
from django.utils.decorators import method_decorator



def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")




def user_profile(request, username):
    profile_user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(author=profile_user).order_by('-date_posted')  # if no posts? erro

    followers = Follow.objects.filter(followed=profile_user, following=True).count()
    following = Follow.objects.filter(follower=profile_user, following=True).count()

    current_user = request.user

    if current_user != profile_user and request.user.is_authenticated:
        diff_users = True

        try:
           follow = Follow.objects.get(followed=profile_user, follower=current_user)
           follow = follow.following

        except Follow.DoesNotExist:
            follow = False

    else:
        diff_users = False
        follow = False

    context = {
        "current_user" : current_user,
        "profile_user" : profile_user,
        "diff_users": diff_users,
        "posts": posts,
        "follow": follow,
        "followers": followers,
        "following": following
    }

    return render(request, "network/profile.html", context)
    
    
