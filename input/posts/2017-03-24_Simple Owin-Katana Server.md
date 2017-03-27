{"description":"It takes 2 minutes to write an OWIN/Katana we server starting from a default C# console app."}

## What

A full explanation about how OWIN, Katana, WebApi and MVC5 work, starting from a standard console application.

No magic allowed.

I try and explain why parts are there and how they work.
I want to minimise the potential for [misconceptions](http://www.aft.org/ae/spring2016/sadler-and-sonnert).

### A side on Misconceptions 

The levels of abstractions with web techs can be a bit bewildering as there is no logical path to understand it from your code alone.
This applies double when dependency injection used, objects appear to materialise from nowhere.

Our minds don't like being ignorant, so we tend sub-consciously to fill in gaps with guesses, which in time cement into fake truths; misconceptions.
This is also part of what leads to cargo cult programming, repeating a set of magical actions that seem to create a desired result.

These mis-truths leads to sloppy programming and bugs.
It can also lead to an ever increasing sense of confusion that you eventually drown in. Not fun.

The key to avoiding these problems is to fully break down and understand underlying concepts before moving onto bigger concepts.
Sadly we don't really have time to do this for every framework and tech we use, but I see it as something worth striving for.
Part of the problem is solved with good abstractions that don't require any underlying knowledge, but that isn't always possible.


## A Basic OWIN / Katana Server with Middleware

To begin with lets write a tiny hello web server, it will be fully explained afterwards.
This isn't the shortest way to write the hello world server, but it is more idiomatically correct.

Start by creating an default C# console application in Visual Studio.

Open the manage Nuget packages window (or use the PM console) and add:

* `Microsoft.Owin.Hosting` (`Owin` and `Microsoft.Owin` should be automatically added aswell).
* `Microsoft.Owin.Host.HttpListener`

This following listing is the full code for our first sample server.
It adds 2 small classes and the code to launch the server in main.

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Owin.Hosting;
using Owin;

namespace SimpleOwinExample
{
    using AppFunc = Func<IDictionary<string, object>, Task>;

    class Program
    {
        private static void Main(string[] args)
        {
            var uri = "http://localhost:8910";

            using (WebApp.Start<Startup>(uri))
            {
                Console.WriteLine($"### Server started at {uri}");
                Console.WriteLine("### Press anykey to shut down server.");
                Console.ReadKey();
                Console.WriteLine("### Server shutting down.");
            }
        }
    }

    class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.Use<SampleMiddleWare>();
            app.Use((context, next) => context.Response.WriteAsync("This is not hello."));
        }
    }

    class SampleMiddleWare
    {
        private readonly AppFunc _next;

        public SampleMiddleWare(AppFunc next)
        {
            _next = next;
        }

        public async Task Invoke(IDictionary<string, object> environment)
        {
            Console.WriteLine("Start of SampleMiddleWare");
            if (environment["owin.RequestPath"].ToString().Contains("hello"))
            {
                using (var writer = new StreamWriter((Stream) environment["owin.ResponseBody"]))
                {
                    await writer.WriteAsync("Salutations.");
                }
            }
            else
            {
                await _next.Invoke(environment);
            }
            Console.WriteLine("End of SampleMiddleWare");
        }
    }
}
```

Type that code into your `Program.cs` and then hit run.
A console window should pop up with the server-started message.

Now we can test the server by going to `http://localhost:8910/hello` in the browser.
Without the hello you should get the default 404.



If you have bash with `cURL` then you test it there:

```bash
$ curl localhost:8910
This is not hello.
$ curl localhost:8910/hello
Salutations.
```

Or With Powershell:

```powershell
PS C:\Users\t3hmu> Invoke-WebRequest -UseBasicParsing -URI "http://localhost:8910"

StatusCode        : 200
StatusDescription : OK
Content           : {84, 104, 105, 115...}
RawContent        : HTTP/1.1 200 OK
                    Transfer-Encoding: chunked
                    Date: Mon, 27 Mar 2017 17:01:31 GMT
                    Server: Microsoft-HTTPAPI/2.0

                    This is not hello.
Headers           : {[Transfer-Encoding, chunked], [Date, Mon, 27 Mar 2017 17:01:31 GMT], [Server, Microsoft-HTTPAPI/2.0]}
RawContentLength  : 18

PS C:\Users\t3hmu> Invoke-WebRequest -UseBasicParsing -URI "http://localhost:8910/hello"


StatusCode        : 200
StatusDescription : OK
Content           : {83, 97, 108, 117...}
RawContent        : HTTP/1.1 200 OK
                    Transfer-Encoding: chunked
                    Date: Mon, 27 Mar 2017 17:01:35 GMT
                    Server: Microsoft-HTTPAPI/2.0

                    Salutations.
Headers           : {[Transfer-Encoding, chunked], [Date, Mon, 27 Mar 2017 17:01:35 GMT], [Server, Microsoft-HTTPAPI/2.0]}
RawContentLength  : 12
```

The browser would be the normal option for testing MVC apps.
With WebAPI a program like Postman or Insomnia would make more sense.
Using a command line tools is nice for something super simple such as this.




## Explaining the Parts of the Basic Server

### What is OWIN / Katana

OWIN is a standard for creating web applications in a modular manner decoupled from the server and hosting.

Some basic definitions from [the OWIN spec](http://owin.org/html/spec/owin-1.0.html) (I've added examples in _(italics)_):

> **Server** — The HTTP server that directly communicates with the client and then uses OWIN semantics to process requests. Servers may require an adapter layer that converts to OWIN semantics _(HTTPListener, IIS, test or mock server)_.

> **Web Framework** — A self-contained component on top of OWIN exposing its own object model or API that applications may use to facilitate request processing. Web Frameworks may require an adapter layer that converts from OWIN semantics _(MVC5, Nancy, WebApi etc.)_. 

> **Web Application** — A specific application, possibly built on top of a Web Framework, which is run using OWIN compatible Servers _(your code)_. 

> **Middleware** — Pass through components that form a pipeline between a server and application to inspect, route, or modify request and response messages for a specific purpose. _(We will learn about this)_

> **Host** — The process an application and server execute inside of, primarily responsible for application startup. Some Servers are also Hosts _(Command Line App, IIS, Test Runner)_.

OWIN is a the specification for a interface between the server and the web-application designed to decouple the two.
This means that a OWIN based application should be trivial to move between servers, which is extremely useful during development.
This should make the application run predictably when shifting from a local test host to any kind of cloud or production server.

Katana is the name for Microsoft's implementation of OWIN, though all the packages are called `Owin.` and `Microsoft.Owin.`.
The Katana name isn't actually used in the namespaces.


### OWIN in a bit of detail

[The OWIN spec](http://owin.org/html/spec/owin-1.0.html) isn't particularly long and is worth a scan.

There are 2 core concepts:

* Each request received by the server is encapsulated in a single dictionary (`IDictionary<string, object> environment`).
* The concept of middleware, a series of methods that run in a chain that try and deal with the request.

The dictionary makes the task of adapting an existing server to the OWIN interface rather simple.
Package all the request information into the dictionary and then forward to the OWIN interface.

The OWIN spec has a [neat table](http://owin.org/html/spec/owin-1.0.html#3-2-1-request-data) of a few standard items that must be included in the dictionary.
Middleware can add extra items to the dictionary as a way of passing data to each other. 


TODO: Middleware diagram
TODO: Middleware stack diagram


### The Code Line by Line

#### WebApp

The main starts the web-server with:

`using (WebApp.Start<Startup>(uri))`

`WebApp` is a part of `Microsoft.Owin.Hosting` a handy library for starting a server.

The library itself does some naughty hidden things; in [`Microsoft.Owin.Hosting/Constants.cs`](https://github.com/aspnet/AspNetKatana/blob/9f6e09af6bf203744feb5347121fe25f6eec06d8/src/Microsoft.Owin.Hosting/Constants.cs)
`DefaultServer = "Microsoft.Owin.Host.HttpListener"` is defined.
This means by default `WebApp.Start` tries to use `Microsoft.Owin.Host.HttpListener` as the server implementation.
It is not an dependency of `Microsoft.Owin.Hosting` so we had to manually add the reference via Nuget otherwise the code would have crashed on when run.

It is written like this because `WebApp.Start()` allows you to pass other implementations as an option so it doesn't always depend on `Microsoft.Owin.Host.HttpListener`.
Without reading the code this looks a lot like magic.


Like any other command line application the program ends when the `Main()` completes so we use a `Console.ReadKey()` to keep the server running.

#### Startup

The `Startup` class is what we use to configure the server, supplied to `Webapp.Start()` via the generic type parameter.

The `IAppBuilder` is used to build the middleware pipeline.
Middleware are added using passing a function into `.Use()` method (also `.Run()` and `.Map()` with different features).

When a request is received the first middleware added is launched.
The middleware is given 2 parameters: 

* The OWIN dictionary containing all of the request and response information (`environment`).
* A function that calls the next middleware in the pipeline in a similar manner(`next`). 

The normal convention with middleware is that it should not call the next middleware if it writes the response.
That way the middleware keep calling the next one until one decides to write the response.

With the example application you will see the messages in the console showing the flow through the middleware code.


The second `Use()` call uses a few features of Katana that make it easy to quickly write small middlewares.
The `context` object has some helper methods such as `Response.WriteAsync()`, 
which is a shortcut for writing to the `environment["owin.ResponseBody"]` stream.
The `next` parameter in the lambda is the same as the `_next` in the `SampleMiddleWare`.

Normally if you want to write a quick middleware that does not call `next()` you'd use `app.Run()` instead, which simply skips the next parameter.

Finally `app.Map()` lets you add some more middleware that only execute if a specified path is matched.
The following is the equivalent of the `SampleMiddleWare`:

```csharp
app.Map("/bye", builder => builder.Run(context => context.Response.WriteAsync("bye")));
```


## How Does WebAPI and MVC5 fit in?

TODO: