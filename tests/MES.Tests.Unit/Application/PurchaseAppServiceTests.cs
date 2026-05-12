using MES.Application.DTOs;
using MES.Application.Services;
using FluentAssertions;
using Xunit;

namespace MES.Tests.Unit.Application;

public class PurchaseAppServiceTests
{
    private readonly PurchaseAppService _sut = new();

    [Fact]
    public async Task CreateAsync_ShouldReturnOrderWithDraftStatus()
    {
        var request = new CreatePurchaseOrderRequest
        {
            OrderNumber = "PO-NEW-001",
            SupplierName = "测试供应商",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "MAT-001", MaterialName = "测试物料", Unit = "PCS", Quantity = 10, UnitPrice = 100 }
            }
        };

        var result = await _sut.CreateAsync(request);

        result.OrderNumber.Should().Be("PO-NEW-001");
        result.Status.Should().Be("Draft");
        result.SupplierName.Should().Be("测试供应商");
        result.Items.Should().HaveCount(1);
        result.TotalAmount.Should().Be(1000);
        result.Id.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetAllAsync_AfterCreate_ShouldContainNewOrder()
    {
        var before = await _sut.GetAllAsync();
        var beforeCount = before.Count;

        await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-LIST-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 1, UnitPrice = 10 }
            }
        });

        var after = await _sut.GetAllAsync();
        after.Should().HaveCount(beforeCount + 1);
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotExists_ShouldReturnNull()
    {
        var result = await _sut.GetByIdAsync("non-existent-id");

        result.Should().BeNull();
    }

    [Fact]
    public async Task SubmitAsync_ShouldTransitionToSubmitted()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-SUBMIT-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 1, UnitPrice = 10 }
            }
        });

        var result = await _sut.SubmitAsync(created.Id);

        result.Status.Should().Be("Submitted");
    }

    [Fact]
    public async Task ConfirmAsync_ShouldTransitionToConfirmed()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-CONFIRM-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 1, UnitPrice = 10 }
            }
        });
        await _sut.SubmitAsync(created.Id);

        var result = await _sut.ConfirmAsync(created.Id);

        result.Status.Should().Be("Confirmed");
    }

    [Fact]
    public async Task ReceiveAsync_ShouldUpdateReceivedQuantity()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-RECEIVE-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 10, UnitPrice = 10 }
            }
        });
        await _sut.SubmitAsync(created.Id);
        await _sut.ConfirmAsync(created.Id);

        var result = await _sut.ReceiveAsync(created.Id, new ReceiveRequest { MaterialCode = "M1", Quantity = 5 });

        result.Items[0].ReceivedQuantity.Should().Be(5);
        result.Status.Should().Be("PartiallyReceived");
    }

    [Fact]
    public async Task ReceiveAsync_WhenFullyReceived_ShouldTransitionToCompleted()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-FULL-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 10, UnitPrice = 10 }
            }
        });
        await _sut.SubmitAsync(created.Id);
        await _sut.ConfirmAsync(created.Id);

        var result = await _sut.ReceiveAsync(created.Id, new ReceiveRequest { MaterialCode = "M1", Quantity = 10 });

        result.Items[0].ReceivedQuantity.Should().Be(10);
        result.Status.Should().Be("Completed");
    }

    [Fact]
    public async Task CancelAsync_ShouldTransitionToCancelled()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-CANCEL-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 1, UnitPrice = 10 }
            }
        });

        await _sut.CancelAsync(created.Id);

        var result = await _sut.GetByIdAsync(created.Id);
        result!.Status.Should().Be("Cancelled");
    }

    [Fact]
    public async Task SubmitAsync_WhenNotExists_ShouldThrow()
    {
        var act = () => _sut.SubmitAsync("non-existent");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*不存在*");
    }

    [Fact]
    public async Task FullLifecycle_ShouldFollowExpectedTransitions()
    {
        var created = await _sut.CreateAsync(new CreatePurchaseOrderRequest
        {
            OrderNumber = $"PO-LIFECYCLE-{Guid.NewGuid()}",
            SupplierName = "S1",
            CreatedBy = "admin",
            Items = new List<CreatePurchaseLineRequest>
            {
                new() { MaterialCode = "M1", MaterialName = "M1", Unit = "PCS", Quantity = 5, UnitPrice = 20 }
            }
        });
        created.Status.Should().Be("Draft");

        var submitted = await _sut.SubmitAsync(created.Id);
        submitted.Status.Should().Be("Submitted");

        var confirmed = await _sut.ConfirmAsync(created.Id);
        confirmed.Status.Should().Be("Confirmed");

        var received = await _sut.ReceiveAsync(created.Id, new ReceiveRequest { MaterialCode = "M1", Quantity = 5 });
        received.Status.Should().Be("Completed");
    }
}
