using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using InventarioSOAP_A.Data;
using InventarioSOAP_A.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<InventarioDBContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("InventarioConnection")
    )
);

builder.Services.AddScoped<CatalogoService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://127.0.0.1:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services
    .AddServiceModelServices()
    .AddServiceModelMetadata();

builder.Services.AddSingleton<IServiceBehavior,
    UseRequestHeadersForMetadataAddressBehavior>();

builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowSynchronousIO = true;
});

builder.WebHost.UseUrls("http://localhost:5163");

var app = builder.Build();

app.UseCors("AngularApp");

app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder
        .AddService<CatalogoService>()
        .AddServiceEndpoint<CatalogoService, ICatalogoService>(
            new BasicHttpBinding(),
            "/CatalogoService.svc"
        );
});

var metadataBehavior =
    app.Services.GetRequiredService<ServiceMetadataBehavior>();

metadataBehavior.HttpGetEnabled = true;

app.Run();
